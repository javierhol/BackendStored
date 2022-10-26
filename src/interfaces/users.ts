interface PersonLogin {

    correo: string;
    password: string;
    authCuenta:Boolean;
}
export interface PersonRegister extends Pick<PersonLogin, "correo" | "password"|"authCuenta"> {}
export interface Roles {
     nameRol: Array<string>;
}
export interface PersonRegister extends Pick<Roles, "nameRol"> {
     token: string;
    refreshToken: string;
}
export interface login extends Pick<PersonLogin, "correo" | "password" | "authCuenta"> {
    token: string;
    refreshToken: string;
}
export interface login extends Pick<Roles, "nameRol"> {}
