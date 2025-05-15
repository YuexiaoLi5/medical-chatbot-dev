export interface Patient {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  phone_number: string;
  moderate_hr_min: number;
  moderate_hr_max: number;
  vigorous_hr_min: number;
  vigorous_hr_max: number;
  target_duration_week: number;
  prompt_times: string[];
  medical_condition: string;
  disability_level: string;
  created_at: string; // ✅ 新增字段
}
