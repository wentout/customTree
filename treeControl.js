(function( jQuery, undefined ){
jQuery.fn.extend( {
	treeControl : function( x ) {
		var e;
		try{
			$.map( this, function( el, idx ){

			var rand = function(){ var dt = new Date(); return Math.floor( Math.random()*dt.getTime() ); }

			var treeRoot = function( className ){
				var nm = '' + x.theme + '-tree-root';
				if( className ){ return nm; }else{ return x.obj.find( 'ul.' + nm ); }
			}

			x.obj		= $( el );
			x.name		= x.name		|| function( obj ){ return obj.name; }		// function, returning name

			x.root		= x.root 		|| 'top'			// root element & root query
			x.theme		= x.theme 		|| 'custom'			// theme class predicate
			x.info		= x.info		|| function(){};
			x.animate	= x.animate		|| 500;
			x.preloader	= x.preloader 	|| 1				// 0 -- do not use || 1 -- use at startup || use always
			x.classes	= x.classes		|| {};
			$.extend( x.classes , $.extend( {
				  treeLeaf	: 'tree-leaf'
				, heading	: 'heading'
				, control	: 'control'
				, status	: 'status'
				, loader	: 'loader'
				, selected	: 'selected'
				, preloader	: 'preloader'
				, hover		: 'hover'
			} , x.classes ) );
			x.control	= x.control		|| { text : ['+', '&ndash;'], cls : 'open' };

			// x.template must be jq.tmpl()
			x.template	= x.template	|| '<li><span class = "' + x.classes.heading + '">${obj.name}</span><ul class = "' + x.classes.treeLeaf + '"></ul></li>';
			x.ctrlTpl	= x.ctrlTpl		|| '<span class = "' + x.classes.control + '"></span>';
			x.statusTpl	= x.statusTpl	|| '<span class = "' + x.classes.status + '"></span>';

			x.current	= null; 		// evt.data.x.current when x.handlers.select/blur

			x.handlers = x.handlers		|| {};
			$.extend( x.handlers, $.extend( {
				  control	: false // function that fires after leaf control state changes +/-
				, select	: false // function that fires after leaf heading select occures
				, blur		: false // function that fires after leaf heading select blurs selection
				, leafsAdd	: false // what to do after leaf add, attrs : ( leaf, controlObject )
			} , x.handlers ) );

			x.cbcs	= {
				  click		: function( evt ){
					try{
						evt.stopPropagation();
						var result2 = function(){
							try{
								var elem = evt.data.leaf;
								x.current = elem;
								$( x.current.elem.heading ).addClass( x.classes.selected );
								try{ ( x.callbacks && x.callbacks.click) && x.callbacks.click ( elem ); }catch(e){ alert(e); }
								x.handlers.select && x.handlers.select( elem );
							}catch(e){ alert(e); }
						}
						if( x.current ){
							var result = function(){
									$( x.current.elem.heading ).removeClass( x.classes.selected );
									result2(); 
							}
							if( x.handlers.blur ) {
								x.handlers.blur( x.current , result ) ;
							}else{ result(); }
						}else{ result2(); }
					}catch(e){ alert(e); }
				}
				, mouseover	: function( evt ){
					var elem = evt.data.leaf;
					$( elem.elem.heading ).addClass( x.classes.hover );
					try{ ( x.callbacks && x.callbacks.mouseover) && x.callbacks.mouseover ( elem ); }catch(e){ alert(e); }
				}
				, mouseout	:  function( evt ){
					var elem = evt.data.leaf;
					$( elem.elem.heading ).removeClass( x.classes.hover );
					try{ ( x.callbacks && x.callbacks.mouseout) && x.callbacks.mouseout ( elem ); }catch(e){ alert(e); }
				}
			};


			if( $.cookie ) {
				if( x.saveState !== undefined ){
					if( typeof( x.saveState ) !== 'object' ) {
						x.saveState = { name : 'tree_control_cookie_name', opts : { expires: 7 } };
					}
					if($.cookie( x.saveState.name ) == null){
						$.cookie( x.saveState.name , '', x.saveState.opts );
					}
				}
			}

			x.templateName = 'treeLeafTemplate' + rand();
			$.template( x.templateName, x.template );

			x.obj.on( 'click', function( evt ){
				try{
					// var tf = ( $(evt.target).parentsUntil('ul.'+x.classes.treeLeaf).length == 0 );
					if( x.current ){
						x.handlers.blur && x.handlers.blur( x.current , function(){
							$( x.current.elem.heading ).removeClass( x.classes.selected );
							x.current = null;
						});
					}
				}catch(e){ alert(e); }
			} );


			var getPath	= function( leaf , parent ){
				if( leaf ){
					var arr = [];
					var construct = function( leaf ){
						arr.push( leaf );
						if( leaf.parent ){ construct( leaf.parent ); }
					};
					construct( leaf );

					var arrp = arr.slice( 0 );
					arrp.pop();
					arrp.reverse();
					var strp = '';
					$.map( arrp, function(el){ strp += '/' + el.name; } );
					strp += '/';

					arr.reverse();
					parent && arr.pop();
					var str = '';
					$.map( arr, function(el){ str += '/' + el.name; } );

					return { str : str, strp : strp, arr : arr , leaf : parent ? ( leaf.parent ? leaf.parent : treeViewModel ) : leaf };
				}else{
					return { str : '/' + treeViewModel.name , strp : '/', arr : [ treeViewModel ] , leaf : treeViewModel };
				}
			};
			
			var getTree = function( leaf, merge, transform_function ){
				try{
					var tree = {};
					if(leaf){
						tree.name = leaf.name;
						tree.path = getPath(leaf, true);
						if(typeof(merge) == 'object'){
							$.extend(tree, merge);
						}
						if(typeof(transform_function) == 'function'){
							tree = transform_function(tree);
						}
						if(leaf.children !== undefined){
							var len = leaf.children.length;
							if(len > 0){
								tree.children = [];
								for(var i = 0; i < len; i++){
									tree.children.push(getTree(leaf.children[i], merge, transform_function));
								}
							}
						}
					}
					return tree;
				}catch(e){ debugger; }
			};
			
			var gsCook = function( leafObj , ret ) {
				try{
					if( $.cookie && x.saveState && leafObj ){
						var cook = $.cookie( x.saveState.name );
						if( cook.length > 0 ) {
							var cook = cook.split(',');
							var inarr = $.inArray( encodeURIComponent( getPath( leafObj ).str ), cook );
							if( ret ) { if( inarr === ( -1 ) ){ return false; }else{ return true; } }
							else{
								if( inarr === ( -1 ) ){
									if( leafObj.obj.open == true ){
										cook.push( encodeURIComponent( getPath( leafObj ).str ) );
									}
								}else{
									if( leafObj.obj.open == false ){
										cook.splice( inarr, 1 );
									}
								}
							}
						}else{
							cook = [];
							if( ret ) { return false; } else { if ( leafObj.obj.open == true ){ cook.push( encodeURIComponent( getPath( leafObj ).str ) ); } }
						}
						$.cookie( x.saveState.name , cook.join(), x.saveState.opts );
					}else{ if( ret ){ return false; } }
				}catch(e){ alert(e); if( ret ){ return false; } }
			};

			var makeLeaf = function( preObj , parent ){
				try{
					preObj = preObj || { name : '' };
					var obj =  {
						  obj		: preObj
						, name		: preObj.name
						, children	: []
						, parent	: parent
					};
					obj.obj.name = x.name( preObj );
					if( obj.obj.open ){ gsCook( obj ); }
					else{ obj.obj.open = gsCook( obj , true ); }
					return obj;
				}catch(e){ alert(e); return false; }
			};

			x.obj.addClass( treeRoot(true) );
			x.obj.html( $('<ul class = "' + treeRoot( true ) + '"></ul>') );
			var treeViewModel = makeLeaf( { name : x.root, open : true } );
			treeViewModel.elem = {};
			treeViewModel.elem.ul = x.obj.find( 'ul.' + treeRoot( true ) );
			x.treeRoot = treeRoot;

			var makeElem = function( object, num ){
				var elem = { li : object.find('li')[ num ] };
				elem.ul = $( elem.li ).find( 'ul.' + x.classes.treeLeaf );
				elem.heading = $( elem.li ).find( 'span.' + x.classes.heading );
				elem.heading.before( x.ctrlTpl );
				elem.heading.before( x.statusTpl );
				elem.status = $( elem.li ).find( 'span.' + x.classes.status );
				elem.control = $( elem.li ).find( 'span.' + x.classes.control );
				return elem;
			};

			var leafControl	= function( leaf , addCallback ){
				if( leaf.obj.folder ){
					if( leaf.obj.open ){
						gsCook( leaf ); // ADD
						leaf.elem.control.html( x.control.text[1] );
						leaf.elem.status.addClass( x.control.cls );
						if( leaf.children.length == 0 ) {
							(function( leaf , cb ){
								window.setTimeout( function(){ controlObject.leaf( leaf , cb ); }, x.animate );
							})( leaf , addCallback );
						}else{ leaf.elem.ul.slideDown( x.animate ); }
					}else{
						gsCook( leaf ); // DELETE
						leaf.elem.control.html( x.control.text[0] );
						leaf.elem.status.removeClass( x.control.cls );
						leaf.elem.ul.slideUp( x.animate );
					}
				}else{
					leaf.elem.control.html( x.control.text[1] );
					leaf.elem.control.removeClass( x.control.cls );
				}
				x.handlers.control && x.handlers.control( leaf );
			};

			var parseLeaf = function( leaf, obj, pl_callback ) { // where to add, what JSON to add,
				try{
					object = leaf.elem.ul;
					object.hide();
					object.empty();
					leaf.children = [];
					// leafControl( leaf );

					for( var i = 0; i < obj.length; i++ ){ leaf.children.push( makeLeaf( obj[i] , leaf ) ); }

					$.tmpl( x.templateName, leaf.children ).appendTo( object );

					for( var i = 0; i < leaf.children.length; i++ ){

						var child = leaf.children[ i ];
						elem = makeElem( object, i );

						child.obj.open = child.obj.open || false ;
						child.elem = elem;
						leafControl( child );

						try{
							elem.control.on( 'click', { leaf: child }, function( evt ) {
								var leaf = evt.data.leaf;
								leaf.obj.open = !leaf.obj.open;
								leafControl( leaf );
							} );

							for( var k in x.cbcs ){
								( function( evtype, callback ){
									elem.heading.on( evtype, { leaf: child }, callback );
								})( k, x.cbcs[ k ] );
							}

						}catch(e){ alert(e); }
					}
					object.slideDown( x.animate , function(){
						pl_callback && pl_callback( leaf , controlObject );
						x.handlers.leafsAdd && x.handlers.leafsAdd( leaf , controlObject );
						if( x.preloader > 0){ x.obj.removeClass( x.classes.preloader ); }
					} );
				}catch(e){ alert(e); }
			};

			var controlObject = {
				  leaf			: function( leaf , callback ) {
					try{
						var cb = function( data ){
							try{
								// leaf.elem.heading && leaf.elem.heading.removeClass( x.classes.loader );
								controlObject.shLoader( leaf , false );
								if( data !== '' ){
									x.info( 'leaf data received :\n'+data);
									parseLeaf( leaf , $.parseJSON( data ) , callback );
								}
							}catch(e){ alert(e); }
						}
						if( x.preloader > 1){ x.obj.addClass( x.classes.preloader ); }
						leaf.elem.heading && leaf.elem.heading.addClass( x.classes.loader );
						controlObject.shLoader( leaf , true );
						x.ws( getPath( leaf ).str, cb );
					}catch(e){ alert(e); }
				}
				, shLoader		: function( leaf , tf ){
					try{ if( leaf.elem.heading ){
						if( tf ){ leaf.elem.heading.addClass( x.classes.loader ); }else{ leaf.elem.heading.removeClass( x.classes.loader ); }
					} }catch(e){ alert(e); }
				}

				, getPath		: getPath
				, getTree		: getTree
				, getTreeCurrent: function(merge, transform_function){
					return getTree(x.current, merge, transform_function);
				}
				, currentPath	: function( parent ){
					return getPath( x.current , parent );
				}
				, ws 			: x.ws
				, x : x
				, treeViewModel : treeViewModel
				, leafControl	: leafControl
			};

			try{
				window.setTimeout( function(){
					if( x.preloader > 0){ x.obj.addClass( x.classes.preloader ); }
					controlObject.leaf( treeViewModel );
				}, x.init[0] );
			}catch(e){ alert(e); }

			// x.obj.attr( 'tree' , controlObject ); // not working, because $.attr() sets it to 'string'
			x.obj.prop( 'tree' , controlObject ); //x.obj[0].tree = controlObject;
			return x.obj;

		} );
		}catch(e){ alert(e); }
	}
} );
})( jQuery );