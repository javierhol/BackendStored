interface PersonLogin {

    email: string;
    password: string;
    auth:Boolean;
}
export interface PersonRegister extends Pick<PersonLogin, "email" | "password"|"auth"> {}
export interface Roles {
     nameRol: Array<string>;
}
export interface PersonRegister extends Pick<Roles, "nameRol"> {
     token: string;
    refreshToken: string;
}
export interface login extends Pick<PersonLogin, "email" | "password" | "auth"> {
    token: string;
    refreshToken: string;
}
export interface login extends Pick<Roles, "nameRol"> {}
