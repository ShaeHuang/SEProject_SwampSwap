export interface RegisterData {
  userName: string;
  email: string;
  location: string;
  phoneNumber: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  location: string;
  phoneNumber: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface CurrentUser {
  id: number;
  username: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const register = async (
  data: RegisterData,
): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: data.userName, password: data.password }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Registration failed");
  }

  return {
    message: "Register successful",
    user: {
      id: "",
      userName: data.userName,
      email: data.email,
      location: data.location,
      phoneNumber: data.phoneNumber,
    },
  };
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: data.identifier, password: data.password }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Login failed");
  }

  const token: string = json["login successful, user token:"];
  localStorage.setItem("token", token);

  return {
    message: "Login successful",
    token,
  };
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No active session");
  }

  const response = await fetch(`${BASE_URL}/admin/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Failed to load current user");
  }

  return {
    id: json.data.ID,
    username: json.data.username,
  };
};
