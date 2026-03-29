import { supabase } from '../supabaseClient';

/**
 * Authentication service for Supabase
 * Includes logging for debugging as requested.
 */

export const signUp = async (email: string, password: string, fullName: string, phone: string) => {
  console.log('AuthService: Attempting signUp for', email);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      }
    });

    if (error) {
      console.error('AuthService: signUp error', error);
      throw error;
    }

    console.log('AuthService: signUp success response', data);
    console.log('AuthService: User object', data.user);
    
    // If a session is returned, the user is immediately logged in (email confirmation is disabled in dashboard)
    if (data.session) {
      console.log('AuthService: Session established immediately');
    } else {
      console.warn('AuthService: No session returned. Email confirmation might be required in Supabase Dashboard.');
    }

    return data;
  } catch (error) {
    console.error('AuthService: signUp unexpected error', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  console.log('AuthService: Attempting signIn for', email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('AuthService: signIn error', error);
      throw error;
    }

    console.log('AuthService: signIn success response', data);
    console.log('AuthService: User object', data.user);
    return data;
  } catch (error) {
    console.error('AuthService: signIn unexpected error', error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  console.log('AuthService: Attempting forgotPassword for', email);
  try {
    // Using window.location.origin ensures it works in both dev and shared environments
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('AuthService: forgotPassword error', error.message);
      throw error;
    }

    console.log('AuthService: forgotPassword success', data);
    return data;
  } catch (error) {
    console.error('AuthService: forgotPassword unexpected error', error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  console.log('AuthService: Attempting updatePassword');
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('AuthService: updatePassword error', error.message);
      throw error;
    }

    console.log('AuthService: updatePassword success', data);
    return data;
  } catch (error) {
    console.error('AuthService: updatePassword unexpected error', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  console.log('AuthService: Fetching current user');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('AuthService: getUser error', error.message);
      return null;
    }

    console.log('AuthService: Current user', user);
    return user;
  } catch (error) {
    console.error('AuthService: getUser unexpected error', error);
    return null;
  }
};

export const logout = async () => {
  console.log('AuthService: Attempting logout');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthService: logout error', error.message);
      throw error;
    }
    console.log('AuthService: logout success');
  } catch (error) {
    console.error('AuthService: logout unexpected error', error);
    throw error;
  }
};
