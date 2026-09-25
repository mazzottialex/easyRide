const { getRoute } = require('../services/osrmServices')

async function getRouteController(req, res) {
  try {
        const { pickup, destination } = req.query
        const route = await getRoute(`${pickup};${destination}`)
        res.json({route})
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
  }
}
module.exports = { getRouteController }