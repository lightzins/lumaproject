import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pxlaksthiagyvkivkjof.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bGFrc3RoaWFneXZraXZram9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjAzNDYsImV4cCI6MjA5MjczNjM0Nn0.lINjOJottfnYCDoYf7os3cNhCsCscoolTatSoEJuNsU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'enzoeduardoamaral15@gmail.com',
    password: 'larama2020',
    options: {
      data: {
        name: 'Enzo (Admin)'
      }
    }
  });

  if (error) {
    console.error('Erro ao criar conta:', error.message);
  } else {
    console.log('CONTA SUPREMA CRIADA COM SUCESSO!');
  }
}

createAdmin();
