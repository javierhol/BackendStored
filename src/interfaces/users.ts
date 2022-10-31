interface PersonLogin {

    correo: string;
    password: string;
    authCuenta:Boolean;
}
export interface PersonRegister extends Pick<PersonLogin, "correo" | "password"|"authCuenta"> {}
export interface Roles {
     nameRol: String;
}
export interface PersonRegister extends Pick<Roles, "nameRol"> {
     token: string;
    refreshToken: string;
}
export interface login extends Pick<PersonLogin, "correo" | "password" | "authCuenta"> {
    token: string;
    refreshToken: string;
}

