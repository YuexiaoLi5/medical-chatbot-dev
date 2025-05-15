import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PatientService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async deletePatient(patientId: any) {
    try {
      // Delete from patients table
      const { error: patientsError } = await this.supabaseService
        .getClient()
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (patientsError) {
        throw new Error(
          `Error deleting from table: ${patientsError.message}`,
        );
      }

      return { success: true, message: 'Patient deregistered successfully' };
    } catch (error) {
      throw new Error(`Failed to deregister patient: ${error.message}`);
    }
  }
}
