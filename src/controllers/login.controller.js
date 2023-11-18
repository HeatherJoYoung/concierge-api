const loginService = require('../services/login.service');

class LoginController {
  async login(req, res) {
    const args = req.body;
    loginService.authenticateUser(args, (error, authenticated) => {
      if (error) {
        res.status(500).json({ error: 'Internal server error' })       
      }
      else if (authenticated) {
        res.json({ success: true })
      }
      else {
        res.status(401).json({ error: 'Authentication failed' })
      }
    })
  }
}

module.exports = new LoginController();