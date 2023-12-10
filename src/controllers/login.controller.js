const loginService = require('../services/login.service');

class LoginController {
  async login(req, res) {
    const args = req.body;
    const email = args.email;
    const emailParts = email.split('@');
    const domain = emailParts[1];
    const isEmployee = domain === 'mail.fhsu.edu';
    args['isEmployee'] = isEmployee;

    loginService.authenticateUser(args, (error, data) => {
      if (error) {
        res.status(500).json({ error: 'Internal server error' })
      }
      else if (data) {
        res.json({ 
          success: true,
          data: data
        })
      }
      else {
        res.status(401).json({ error: 'Authentication failed' })
      }
    })
  }    
}

module.exports = new LoginController()
