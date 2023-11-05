const loginService = require('../services/login.service');

class LoginController {
  async login(req, res) {
    const { email, password } = req.body;
    console.log("in LoginController");
    try {
      const isAuthenticated = await loginService.authenticateUser(email, password);
      if (isAuthenticated) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new LoginController();