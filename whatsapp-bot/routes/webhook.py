# import requests
# from requests.exceptions import HTTPError
# from flask import Blueprint, request, jsonify, current_app
# from twilio.twiml.messaging_response import MessagingResponse
# import warnings

# webhook_bp = Blueprint('webhook', __name__)

# @webhook_bp.route("/", methods=["POST"])
# def receive_message():
#     if not request.is_json:
#         return jsonify({"error": "Invalid content type"}), 400
    
#     data: dict = request.get_json()    
#     from_number = data.get("From")
#     message_body = data.get("Body")

#     if not from_number or not message_body:
#         return jsonify({"error": "Invalid message format"}), 400

#     payload = {
#         "from": from_number,
#         "body": message_body
#     }
    
#     # Default response, in case forwarding fails
#     # Otherwise, this will be overridden by the success response
#     whatsapp_msg_response = "Sorry! We encountered an error while processing your message."

#     try:
#         res = requests.post(current_app.config["FORWARD_URL"], json=payload)
#         res.raise_for_status()  # Raise an error for bad responses
#     except HTTPError as err:
#         warnings.warn(f"Failed to forward message: {err}")
#     except Exception as e:
#         warnings.warn(f"Error forwarding message: {e}")
#     else:
#         response_data = res.json()
#         if "response" in response_data:
#             whatsapp_msg_response = response_data["response"]
#         else:
#             warnings.warn(f"Unexpected response format: {response_data}")
    
#     whatsapp_response = MessagingResponse()
#     whatsapp_response.message(whatsapp_msg_response)
#     return str(whatsapp_response), 200
    
    
from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse

webhook_bp = Blueprint('webhook', __name__)

@webhook_bp.route("/", methods=["POST"])
def receive_message():
    # 从 Twilio 提取用户消息
    incoming_msg = request.form.get("Body", "").strip().lower()
    sender = request.form.get("From", "")

    print(f"Received from {sender}: {incoming_msg}")

    # 创建 Twilio 的响应对象
    resp = MessagingResponse()
    msg = resp.message()

    # 自定义静态回复逻辑
    if incoming_msg in ["hi", "hello"]:
        reply = "Hello! I'm your clinic assistant. How can I help you today?"
    elif "appointment" in incoming_msg:
        reply = "Your next appointment is on May 2nd at 10:00 AM. Reply YES to confirm or NO to reschedule."
    elif incoming_msg == "yes":
        reply = "Appointment confirmed. See you soon!"
    elif incoming_msg == "no":
        reply = "Appointment cancelled. Please call +65-xxxx-xxxx to reschedule."
    elif "thanks" in incoming_msg or "thank you" in incoming_msg:
        reply = "You're welcome! Let me know if you need anything else."
    elif "symptom" in incoming_msg or "fever" in incoming_msg or "headache" in incoming_msg:
        reply = "Sorry to hear that. How long have you had these symptoms?"
    elif "2 days" in incoming_msg or "three days" in incoming_msg:
        reply = "Noted. Would you like to schedule a visit to the clinic?"
    else:
        reply = f"Hello! You said: \"{incoming_msg}\".\nThis is a demo reply from your Flask bot."

    msg.body(reply)
    return str(resp), 200
