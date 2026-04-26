-- 1. Primeiro apagamos o perfil associado ao e-mail
DELETE FROM public.profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'enzoeduardoamaral15@gmail.com');

-- 2. Depois apagamos o usuário do sistema de autenticação
DELETE FROM auth.users 
WHERE email = 'enzoeduardoamaral15@gmail.com';
