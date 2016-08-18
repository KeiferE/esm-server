'use strict';

var _ = require ('lodash'),
path = require('path'),
config = require(path.resolve('./config/config')),
nodemailer = require('nodemailer'),
transporter = nodemailer.createTransport(config.mailer.options);


var getRecipientEmail = function(email) {
	if (config.mailer.options === 'gmail') {
		// just do this in case we want to review that we are sending to the correct user/contact
		var n = email.split('@', 1)[0];
		return _.isEmpty(n) ? 'eao.invitee.2016@gmail.com' : 'eao.invitee.2016+' + n + '@gmail.com';
	}
	return email;
};

var sendItem = function(item) {
	return new Promise(function(resolve, reject) {
		var recipientEmail = getRecipientEmail(item.to.email);
		
		var mailOptions = {
			to: recipientEmail,
			from: config.mailer.from,
			subject: item.subject,
			text: item.body,
			html: item.body
		};
		
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				//console.log('Failed to send email to recipient ' + item.to.email + ' using mailer options' + JSON.stringify(config.mailer.options, null, 4));
				reject(new Error(error.toString()));
			} else {
				var result = {to: item.to, accepted: _.includes(info.accepted, recipientEmail), rejected: _.includes(info.rejected, recipientEmail), messageId: info.messageId };
				//console.log('Sent email result: ', JSON.stringify(result));
				resolve(result);
			}
		});
	});
};

var sendAll = function(subject, text, html, to, cc, bcc) {

	return new Promise(function(resolve, reject) {
		var mailOptions = {
			to: to,
			cc: cc,
			bcc: bcc,
			from: config.mailer.from,
			subject: subject,
			text: text,
			html: html
		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				//console.log('Failed to send email to recipient ' + item.to.email + ' using mailer options' + JSON.stringify(config.mailer.options, null, 4));
				reject(new Error(error.toString()));
			} else {
				//var result = {to: item.to, accepted: _.includes(info.accepted, recipientEmail), rejected: _.includes(info.rejected, recipientEmail), messageId: info.messageId };
				//console.log('Sent email result: ', JSON.stringify(info));
				resolve(info);
			}
		});
	});

};

var sendEach = function(subject, text, html, recipients) {

	var a = recipients.map(function(item) {
		return new Promise(function(resolve, reject) {
			var recipientEmail = getRecipientEmail(item.address);

			subject = subject.replace('%TO_NAME%', item.name);
			subject = subject.replace('%TO_EMAIL%', item.address);

			text = text.replace('%TO_NAME%', item.name);
			text = text.replace('%TO_EMAIL%', item.address);

			html = html.replace('%TO_NAME%', item.name);
			html = html.replace('%TO_EMAIL%', item.address);

			//console.log('recipientEmail = ', recipientEmail);
			//console.log('subject = ', subject);
			//console.log('text = ', text);
			//console.log('html = ', html);

			var mailOptions = {
				to: recipientEmail,
				from: config.mailer.from,
				subject: subject,
				text: text,
				html: html
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					//console.log('Failed to send email to recipient ' + item.email + ' using mailer options' + JSON.stringify(config.mailer.options, null, 4));
					reject(new Error(error.toString()));
				} else {
					var result = {to: item.address, accepted: _.includes(info.accepted, recipientEmail), rejected: _.includes(info.rejected, recipientEmail), messageId: info.messageId };
					//console.log('Sent email result: ', JSON.stringify(result));
					resolve(result);
				}
			});
		});
	});

	return Promise.all(a)
		.then(function(res) {
			//console.log(JSON.stringify(res));
		}, function(err) {
			//console.log(JSON.stringify(err));
		});
};


var sendInvitations = function(subject, text, html, invitationData) {
	//console.log('a');

	var a = invitationData.map(function(item) {
		//console.log(item);
		return new Promise(function(resolve, reject) {
			//console.log('b');
			var recipientEmail = getRecipientEmail(item.to.address);

			subject = subject.replace('%TO_NAME%', item.to.name);
			subject = subject.replace('%TO_EMAIL%', item.to.address);

			text = text.replace('%TO_NAME%', item.to.name);
			text = text.replace('%TO_EMAIL%', item.to.address);
			text = text.replace('%INVITATION_PATH%', '/authentication/accept/' + item.invitation._id.toString());


			html = html.replace('%TO_NAME%', item.to.name);
			html = html.replace('%TO_EMAIL%', item.to.address);
			html = html.replace('%INVITATION_PATH%', '/authentication/accept/' + item.invitation._id.toString());

			//console.log('recipientEmail = ', recipientEmail);
			//console.log('subject = ', subject);
			//console.log('text = ', text);
			//console.log('html = ', html);

			var mailOptions = {
				to: recipientEmail,
				from: config.mailer.from,
				subject: subject,
				text: text,
				html: html
			};
			//console.log('c');

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					//console.log('Failed to send email to recipient ' + item.email + ' using mailer options' + JSON.stringify(config.mailer.options, null, 4));
					reject(new Error(error.toString()));
				} else {
					var result = {to: item.to.address, accepted: _.includes(info.accepted, recipientEmail), rejected: _.includes(info.rejected, recipientEmail), messageId: info.messageId };
					//console.log('Sent email result: ', JSON.stringify(result));
					resolve(result);
				}
			});
		});
	});

	return Promise.all(a)
		.then(function(res) {
			//console.log(JSON.stringify(res));
		}, function(err) {
			//console.log(JSON.stringify(err));
		});
};
//
// Expect an array or a single item to deliver.
// Removing the template handling from the email delivery controller.
// We can create a handler in front of this if need be
//
//  to.name is not required and we won't have it for adhoc email addresses
//
//
/*

  Request...
	[
		{
			"subject": "Could send Html body...",
			"body": "<html><body><h1>Hi</h1><p>It's me.</p></body></html>",
			"to": {
				"email": "buddy.guy.2016@gmail.com",
				"name": "Buddy Guy"
			}
		},
		{
			"subject": "Could send text",
			"body": "Boring.",
			"to": {
				"email": "pal.friend.2016.@gmail.com"
			}
		}
	]
	
	Response...
	[
		{
			"to": {
				"email": "buddy.guy.2016@gmail.com",
				"name": "Buddy Guy"
			},
			"accepted": true,
			"rejected": false,
			"messageId": "1470689924649-aa12bac4-01f3e00c-77340e46@gmail.com"
		},
		{
			"to": {
				"email": "pal.friend.2016.@gmail.com"
			},
			"accepted": true,
			"rejected": false,
			"messageId": "1470689924650-d2048785-618fc1ba-3f3961bc@gmail.com"
		}
	]
 */
var send = function(req, res) {
	var items = _.isArray(req.body) ? req.body : [req.body];
	var currentUser = req.user;
	
	var a = items.map(function(item) {
		return sendItem(item);
	});
	return Promise.all(a)
	.then(function(data) {
		res.json(data);
	});
};

module.exports = {
	send: send,
	sendItem: sendItem,
	sendAll: sendAll,
	sendEach: sendEach,
	sendInvitations: sendInvitations
};
