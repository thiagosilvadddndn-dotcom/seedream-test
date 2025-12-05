import { NextRequest } from 'next/server';

export interface AdminCredentials {
  username: string;
  password: string;
}

export function getAdminCredentials(): AdminCredentials {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('Admin credentials not configured. Please set ADMIN_USERNAME and ADMIN_PASSWORD environment variables.');
  }

  return { username, password };
}

export function validateAdminCredentials(inputUsername: string, inputPassword: string): boolean {
  try {
    const { username, password } = getAdminCredentials();
    return inputUsername === username && inputPassword === password;
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return false;
  }
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    return validateAdminCredentials(username, password);
  } catch (error) {
    console.error('Error parsing admin credentials:', error);
    return false;
  }
}

export function createBasicAuthToken(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}