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
}
