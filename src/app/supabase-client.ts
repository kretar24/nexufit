import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  @Injectable({
    providedIn: 'root'
  })

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_KEY
    );
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  async getUserId() {
    const { data, error } = await this.getUser()

    if (error) {
      console.error('Error al obtener el usuario:', error.message);
      return null;
    }

    return data.user.email; // Devuelve el objeto de usuario completo
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  }

  async getCompanyInfo(companyId: number) {
    const { data, error } = await this.supabase.rpc('get_company_info', 
      {
        companyid: companyId
      });
    if (error) {
      console.error('Error al obtener informacion de empresa:', error.message);
      throw error;
    }
    return data;
  }

  async getUserParams(companyId: number) {
    const { data, error } = await this.supabase.rpc('get_user_params_by_company',
    {
      companyid: companyId
    });
    if (error) {
      console.error('Error al obtener la compania:', error);
      return null;
    }
    return data;
  }

  async getUserCompany (): Promise<number>{
    const { data, error } = await this.supabase.rpc('get_company_by_user')
    if (error) {
      console.error('Error al obtener la compania:', error);
      return 0;
    }
    return data;
  }
}
