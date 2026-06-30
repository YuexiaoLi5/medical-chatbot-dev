#!/usr/bin/env python3
"""
使用curl命令每天8点发送模板消息给所有患者
"""

import os
import json
import subprocess
import time
import schedule
from datetime import datetime
import pytz
from dotenv import load_dotenv
from supabase import create_client

# 加载环境变量
if os.path.exists(".env"):
    load_dotenv(override=True)

# 配置
META_ACCESS_TOKEN = os.environ.get("META_ACCESS_TOKEN")
META_PHONE_NUMBER_ID = os.environ.get("META_PHONE_NUMBER_ID")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_API_KEY")  # 注意：.env 文件中是 SUPABASE_API_KEY

# 日志文件
LOG_FILE = "daily_template_curl.log"

def log_to_file(message):
    """写入日志文件"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] {message}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_message)
    print(log_message.strip())

def get_patients():
    """从Supabase获取所有患者"""
    try:
        if not SUPABASE_URL or not SUPABASE_KEY:
            log_to_file("❌ 错误：SUPABASE_URL 或 SUPABASE_KEY 未设置")
            return []

        sb = create_client(SUPABASE_URL, SUPABASE_KEY)

        res = (sb
            .table('patients')
            .select('id, full_name, phone_number')
            .not_.is_('phone_number', 'null')
            .neq('phone_number', '')
            .execute()
        )
        return res.data or []
    except Exception as e:
        log_to_file(f"❌ 获取患者失败：{e}")
        return []

def send_template_via_curl(phone, patient_name):
    """使用curl发送模板消息"""
    if not phone:
        return False

    # 处理手机号
    normalized_phone = phone.replace("-", "").replace(" ", "")
    if len(normalized_phone) == 8:
        normalized_phone = "65" + normalized_phone

    # 构建payload
    payload = {
        "messaging_product": "whatsapp",
        "to": normalized_phone,
        "type": "template",
        "template": {
            "name": "exercise_opt_in_v1",
            "language": {
                "code": "en"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": patient_name
                        }
                    ]
                }
            ]
        }
    }

    api_url = f"https://graph.facebook.com/v18.0/{META_PHONE_NUMBER_ID}/messages"

    # 构建curl命令
    curl_cmd = [
        "curl", "-X", "POST", api_url,
        "-H", f"Authorization: Bearer {META_ACCESS_TOKEN}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload),
        "-s", "-w", "\nHTTP_CODE:%{http_code}\n"
    ]

    try:
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=20)
        output = result.stdout

        # 提取HTTP状态码
        http_code = None
        if "HTTP_CODE:" in output:
            for line in output.split("\n"):
                if line.startswith("HTTP_CODE:"):
                    http_code = line.split(":")[1].strip()
                    break

        if http_code and http_code.startswith("2"):
            try:
                json_output = output.replace("HTTP_CODE:" + http_code, "").strip()
                response_json = json.loads(json_output)
                if "messages" in response_json:
                    log_to_file(f"✅ {normalized_phone} ({patient_name}) - 发送成功")
                    return True
            except:
                pass
        
        log_to_file(f"❌ {normalized_phone} ({patient_name}) - 发送失败 (HTTP {http_code})")
        return False
    except Exception as e:
        log_to_file(f"❌ {normalized_phone} ({patient_name}) - 异常: {e}")
        return False

def send_daily_template_batch():
    """批量发送每日模板消息"""
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_to_file("=" * 70)
    log_to_file(f"📋 开始发送每日模板消息... ({current_time})")
    log_to_file("=" * 70)

    patients = get_patients()
    if len(patients) == 0:
        log_to_file("⚠️ 没有找到任何患者")
        return

    log_to_file(f"📋 找到 {len(patients)} 个患者")

    success_count = 0
    error_count = 0

    for idx, p in enumerate(patients, 1):
        patient_name = p.get('full_name') or p.get('patient_id') or 'Unknown'
        phone = p.get('phone_number', '')

        if send_template_via_curl(phone, patient_name):
            success_count += 1
        else:
            error_count += 1
        
        time.sleep(1)  # 避免API限流

    log_to_file(f"📊 完成: 成功 {success_count}, 失败 {error_count}, 总计 {len(patients)}")
    log_to_file("=" * 70)

def start_scheduler():
    """启动定时任务"""
    log_to_file("🚀 启动每日模板消息服务 (curl版本) ...")

    # 检查配置
    missing_vars = []
    if not META_ACCESS_TOKEN:
        missing_vars.append("META_ACCESS_TOKEN")
    if not META_PHONE_NUMBER_ID:
        missing_vars.append("META_PHONE_NUMBER_ID")
    if not SUPABASE_URL:
        missing_vars.append("SUPABASE_URL")
    if not SUPABASE_KEY:
        missing_vars.append("SUPABASE_API_KEY")

    if missing_vars:
        log_to_file(f"❌ 错误: 以下环境变量未设置: {', '.join(missing_vars)}")
        return

    # 设置新加坡时区
    sgt = pytz.timezone('Asia/Singapore')

    # 注册每天8点的任务 (新加坡时间)
    schedule.every().day.at("08:00").do(send_daily_template_batch)

    job = schedule.jobs[0] if schedule.jobs else None
    
    if job and job.next_run:
        # 显示新加坡时间
        current_sgt = datetime.now(sgt)
        log_to_file(f"📅 任务已注册，下次运行: {job.next_run.strftime('%Y-%m-%d %H:%M:%S')} (当前SGT: {current_sgt.strftime('%Y-%m-%d %H:%M:%S')})")

    log_to_file("🔄 开始运行调度器循环...")

    # 运行调度器循环
    while True:
        schedule.run_pending()
        time.sleep(60)  # 每分钟检查一次

if __name__ == "__main__":
    try:
        start_scheduler()
    except KeyboardInterrupt:
        log_to_file("🛑 停止服务")
    except Exception as e:
        log_to_file(f"❌ 异常: {e}")
