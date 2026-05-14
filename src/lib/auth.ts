import { loginApi, logoutApi, refreshApi } from './api'
import type { LoginVO } from './types'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'blog_refresh_token'

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return
  const d = new Date()
  d.setTime(d.getTime() + days * 86400000)
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return m ? m[1] : null
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

// ── State ──
let _accessToken: string | null = getCookie(ACCESS_KEY)
let _userId: number | null = null
let _username: string | null = null
let _nickname: string | null = null
let _avatar: string | null = null

export const authState = {
  get accessToken() { return _accessToken },
  get userId() { return _userId },
  get username() { return _username },
  get nickname() { return _nickname },
  get avatar() { return _avatar },
  get isLoggedIn() { return !!_accessToken },
}

function setAuth(data: LoginVO) {
  _accessToken = data.accessToken
  _userId = data.userId
  _username = data.username
  _nickname = data.nickname
  _avatar = data.avatar
  setCookie(ACCESS_KEY, data.accessToken, 7)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
  }
}

function clearAuth() {
  _accessToken = null
  _userId = null
  _username = null
  _nickname = null
  _avatar = null
  removeCookie(ACCESS_KEY)
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(REFRESH_KEY)
  }
}

export async function login(username: string, password: string) {
  const res = await loginApi({ username, password })
  setAuth(res.data)
}

export async function logout() {
  try { await logoutApi() } catch { /* ignore */ }
  clearAuth()
}

export async function initFromStorage(): Promise<boolean> {
  if (typeof localStorage === 'undefined') return false
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return false
  try {
    const res = await refreshApi(refreshToken)
    setAuth(res.data)
    return true
  } catch {
    localStorage.removeItem(REFRESH_KEY)
    return false
  }
}

export { clearAuth }
