var express = require('express');
var router = express.Router();
var axios = require('axios');
var util = require('util');
var config = require('../config')
var trans = require('../transaction')
const {
    Keypair,
    StrKey
} = require('stellar-base');


/* PUT register account. */
router.put('/', function (req, res, next) {
    var publicKey = req.body.publicKey

    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
        res.json({
            result: {
                code: 1,
                log: 'invalid public key'
            }
        });
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
    axios.get(config.API_URL + '/broadcast_tx_sync?tx=0x' + hashTx)
        .then(function (response) {
            res.json(response.data);
        })
        .catch(function (error) {
            res.json(error);
        });
});

/* POST sigin account. */
router.post('/', function (req, res, next) {
    var privateKey = req.body.privateKey
    console.log(abc());
    if (!StrKey.isValidEd25519SecretSeed(privateKey)) {
        res.json({
            result: {
                code: 1,
                log: 'invalid private key'
            }
        });
        return;
    }

    const key = Keypair.fromSecret(privateKey);

    const publicKey = key.publicKey();

    axios.get(config.API_URL + '/tx_search?query="account=%27' + publicKey + '%27"')
        .then(function (response) {
            if(response.data.result.total_count == "0")
                res.json({
                    result: {
                        code: 1,
                        log: 'account not register'
                    }
                });
            else
                res.json(response.data);
        })
        .catch(function (error) {
            res.json(error);
        });
});

/* GET sigin account. */
// router.get('/', function (req, res, next) {
//     var privateKey = req.body.privateKey
//     if (!StrKey.isValidEd25519SecretSeed(privateKey)) {
//         res.json({
//             result: {
//                 code: 1,
//                 log: 'invalid private key'
//             }
//         });
//         return;
//     }

//     const key = Keypair.fromSecret(privateKey);

//     const publicKey = key.publicKey();

//     axios.get(config.API_URL + '/tx_search?query="account=%27' + publicKey + '%27"')
//         .then(function (response) {
//             if(response.data.result.total_count == "0")
//                 res.json({
//                     result: {
//                         code: 1,
//                         log: 'account not register'
//                     }
//                 });
//             else
//                 res.json(response.data);
//         })
//         .catch(function (error) {
//             res.json(error);
//         });
// });


module.exports = router;