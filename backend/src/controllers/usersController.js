const { userModel } = require('../models/usersModel');

exports.createUser = (req, res) => {
    const user = new userModel(req.body);
    user.save()
        .then(doc => {
            res.json(doc);
        })
        .catch(err => {
            res.status(500).send(err);
        });
}

exports.getUserByEmail = (req, res) => {
    const email = req.params.email;
    userModel.findOne({ email: email })
        .then(doc => {
            if (!doc) {
                return res.status(404).send('User not found');
            }
            res.json(doc);
        })
        .catch(err => {
            res.status(500).send(err);
        });
}

exports.verifyUser = (req, res) => {
    const { email, password } = req.body;
    userModel.findOne({ email: email })
        .then(doc => {
            if (!doc) {
                return res.status(404).send('User not found');
            }
            if (doc.password !== password) {
                return res.status(401).send('Invalid password');
            }
            res.status(200).json({ user: doc });
        })
        .catch(err => {
            res.status(500).send(err);
        });
}
