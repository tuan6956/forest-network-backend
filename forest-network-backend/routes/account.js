var express = require('express');
var router = express.Router();
var axios = require('axios');
var util = require('util');
var config = require('../config')
var trans = require('../transaction')
const {
    Keypair,StrKey
} = require('stellar-base');


/* GET home page. */
router.put('/', function(req, res, next) {
    var publicKey = req.body.publicKey

    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
        res.json({result: {code: 1, log: 'invalid public key'}});
        return;
    }
    let tx = {
        version: 1,
        account: config.MY_PUBLIC_KEY,
        sequence: 5,
        memo: Buffer.alloc(0),
        operation: 'create_account',
        params: {
            address: publicKey
        },
        signature: Buffer.alloc(64, 0),

    }
    trans.sign(tx, config.MY_PRIVATE_KEY);
    var hashTx = trans.encode(tx).toString('hex');
    console.log(hashTx);
    axios.get('https://zebra.forest.network/broadcast_tx_sync?tx=0x'+hashTx)
        .then(function (response) {
            res.json(response.data);
        })
        .catch(function (error) {
            res.json(error);
        }); 
});

module.exports = router;
