
/*
 * GET home page.
 */

exports.index = function(req, res){
	if(!req.session.username){
		res.render("login");
	}else{
		res.render('index', { title: 'Saetti' });
	}
};
