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
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (
  data: RegisterData,
): Promise<RegisterResponse> => {
  //   const response = await fetch("http://localhost:3000/api/auth/register", {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //   });
  //   return response.json();
  return {
    message: "Register successful",
    user: {
      id: "1",
      userName: data.userName,
      email: data.email,
      location: data.location,
      phoneNumber: data.phoneNumber,
    },
  };
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  //   const response = await fetch("http://localhost:3000/api/auth/login", {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //   });
  //   return response.json();
  return {
    message: "Login successful",
    user: {
      id: "1",
      userName: data.email,
      email: data.email,
      location: "",
      phoneNumber: "",
    },
  };
};
