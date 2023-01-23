const exptress = require('express');
const router = exptress.Router();

router.get('/', (req, res) => {
  console.log('hi')
  res.send('<h1>Hello World</h1>');
});

module.exports = router;

