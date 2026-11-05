import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Debe ingresar su correo o nombre de usuario' })
  login: string; // Puede ser correo o nombreUsuario

  @IsString()
  @IsNotEmpty({ message: 'Debe ingresar la contraseña' })
  password: string;
}