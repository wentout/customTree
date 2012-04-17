<?php
	if( isset( $_POST['action'] ) ){ $action = $_POST['action']; }
	if( isset( $_POST['leaf'] ) ){ $leaf = $_POST['leaf']; }
	
	if( $action == 'get' ){
		if( $leaf == '/top' ){
			echo '[{"name":"Parent1","folder":true}, {"name":"Parent2"}, {"name":"Parent3","folder":true,"open":true}, {"name":"Parent4"}, {"name":"Parent5"}]';
		}
		if( $leaf == '/top/Parent1' ){
			echo '[{"name":"Child1"}, {"name":"Child2"}, {"name":"Child3","folder":true}]';
		}
		if( $leaf == '/top/Parent3' ){
			echo '[{"name":"p3Child1"}, {"name":"p3Child2"}, {"name":"p3Child3","folder":true,"open":true}, {"name":"p3Child4"}, {"name":"p3Child5","folder":true,"open":true}]';
		}
		if( $leaf == '/top/Parent3/p3Child3' ){
			echo '[{"name":"p3c3NChild1"}, {"name":"p3c3NChild2"}, {"name":"p3c3NChild3"}, {"name":"p3c3NChild4"}, {"name":"p3c3NChild5"}, {"name":"p3c3NChild6"}, {"name":"p3c3NChild7"}, {"name":"p3c3NChild8"}, {"name":"p3c3NChild9"}, {"name":"p3c3NChild10"}, {"name":"p3c3NChild11"}]';
		}
		if( $leaf == '/top/Parent3/p3Child5' ){
			echo '[{"name":"p3c5NChild1"}, {"name":"p3c5NChild2"}]';
		}
		if( $leaf == '/top/Parent1/Child3' ){
			echo '[{"name":"NChild1"}, {"name":"NChild2"}, {"name":"NChild3"}, {"name":"NChild4"}, {"name":"NChild5"}, {"name":"NChild6"}, {"name":"NChild7"}, {"name":"NChild8"}, {"name":"NChild9"}, {"name":"NChild10"}, {"name":"NChild11"}, {"name":"NChild12"}, {"name":"NChild13"}, {"name":"NChild14"}, {"name":"NChild15"}]';
		}
	}
?>