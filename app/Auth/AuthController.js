import { AppState } from '../AppState.js'
import { audience, clientId, domain } from '../env.js'
import { AuthService } from './AuthService.js'
import { logger } from '../utils/Logger.js'

const SHOW_SETTINGS = false

function drawUser() {
  const user = AppState.identity ?? null
  const userAvatar = avatarTemplate(user)
  const button = authButton(user)
  const template = /* html */ `
  <div class="d-flex">
    ${userAvatar}
    ${button}
  <div>
  `
  // @ts-ignore
  document.getElementById('authstate').innerHTML = template
}

function _drawAuthSettings() {
  if (!SHOW_SETTINGS) { return }
  const elem = document.createElement('section')
  elem.id = 'auth-settings'
  elem.onclick = () => {
    elem.remove()
  }
  elem.innerHTML = authSettingsTemplate()
  document.body.appendChild(elem)
}
export class AuthController {
  constructor() {
    AppState.identity = null
    AuthService.on(AuthService.AUTH_EVENTS.LOADED, drawUser)
    AuthService.on(AuthService.AUTH_EVENTS.LOADED, _drawAuthSettings)
    drawUser()
  }

  async login() {
    try {
      await AuthService.loginWithRedirect()
    } catch (e) {
      logger.error(e)
    }
  }

  logout() {
    try {
      AuthService.logout()
    } catch (e) {
      logger.error(e)
    }
  }
}

function authButton(user) {
  if (AuthService.loading) { return '' }
  return user
    ? /* html */ `
    <button class="btn text-light selectable-danger" onclick="app.authController.logout()" title="logout"><i class="mdi mdi-logout f-16"></i></button>
  `
    : /* html */ `
    <button class="btn btn-dark selectable-primary" onclick="app.authController.login()">login</button>
  `
}

function avatarTemplate(account) {
  return account
    ? /* html */ `
      <a href="/#/account" class="text-white nav-link selectable rounded" title="Manage Account">
        <img class="rounded-circle" src="${account.picture}" alt="${account.name}" height="45"/>
        <span class="mx-1">${account.nickname || account.name}</span>
      </a>`
    : AuthService.loading
      ? /* html */ `
      <div style="width: 20ch" class="d-flex text-light gap-2 align-items-center placeholder-glow">
        <span class="placeholder rounded-circle" style="height: 40px; width: 40px;"></span>
        <span class="placeholder col h-25 rounded"></span>
      </div >`
      : /* html */`
      <div></div>
      `
}

function authSettingsTemplate() {
  return /* html */`
  <div class="card elevation-2 my-3" title="click to dismiss" style="max-width:clamp(480px, 30vw, 100%); position: absolute; bottom: 15px; left:5px;">
    <div class="card-title p-1 mb-0">
      <div class="d-flex align-items-center">
        <div class="avatar">
          <img src="https://avatars.githubusercontent.com/u/2824157?s=280&v=4" alt="user" height="45" class="rounded-circle">
        </div>
        <div class="text mx-2">
          <b>Auth0 Settings</b>
        </div>
      </div>
    </div>
    <div class="card-body border-top p-2">
      <div class="text block"><b>Domain:</b> ${domain}</div>
      <div class="text block"><b>Audience:</b> ${audience}</div>
      <div class="text block"><b>Client Id:</b> ${clientId}</div>
    </div>
  </div>
`
}
