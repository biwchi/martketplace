export interface LoginInputDto {
  email: string
  password: string
}

export interface SignupInputDto extends LoginInputDto { }

export interface AuthTokensDto {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenInputDto {
  refreshToken: string
}

export interface LogoutInputDto {
  refreshToken: string
}
