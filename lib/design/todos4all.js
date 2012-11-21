module.exports = {
		_id : '_design/todos4all',
		views: {
			byItemSorted: {
				map: function(doc) {
					if (doc.formId === 'item') {
						emit([doc.lastModified], doc);
					}
				}.toString()
			},
			byAppUsers: {
				map: function (doc) {
					if (doc.app_id && doc.control_database) { // multi channel mode
						emit(doc.full_name, {
							name : (doc.full_name || doc.name), 
							control_database : doc.control_database
						})
					}
				}.toString()
			},
			byCollection: {
				map: function(doc) {
					if (doc.collection) {
						emit(doc.collection, doc);
					}
				}.toString()
			}
		}
}