/**
 * Created by harihar mishra on 05/05/16.
 */
document.getElementById("sidebarqa").innerHTML =
    '<ul class="sidebar-menu">'+
    '<li class="header">MAIN NAVIGATION</li>'+
    '<li class="treeview" id="all_games_fe">'+
    '<a href="all_games">'+
    '<i class="fa fa-gamepad"></i> <span>Games</span> </i>'+
    '</a>'+
    '</li>'+
    '<li class="treeview" id="analytics_fe">'+
    '<a href="">'+
    '<i class="fa fa-bar-chart"></i> <span>Analytics</span> <i class="fa fa-angle-left pull-right"></i>'+
    '</a>'+
    '<ul class="treeview-menu">'+
    '<li id="comingsoon_fe"><a href="comingsoon"><i class="fa fa-circle-o"></i> Overview</a></li>'+
    '<li id="comingsoon_fe"><a href="comingsoon"><i class="fa fa-circle-o"></i> Installs</a></li>'+
    '<li id="comingsoon_fe"><a href="comingsoon"><i class="fa fa-circle-o"></i> Sessions</a></li>'+
    '<li id="comingsoon_fe"><a href="comingsoon"><i class="fa fa-circle-o"></i> Game</a></li>'+
    '<li id="comingsoon_fe"><a href="comingsoon"><i class="fa fa-circle-o"></i> User Analytics</a></li>'+
    '</ul>'+
    '</li>'+
    '<li class="treeview" id="in_app_fe" >'+
    '<a href="in_app">'+
    '<i class="fa fa-cart-plus"></i> <span> IN-App</span> </i>'+
    '</a>'+
    '</li>'+
    '<li class="treeview" id="Promotions_fe">'+
    '<a href="">'+
    '<i class="fa fa-trophy"></i> <span>Promotions</span><i class="fa fa-angle-left pull-right"> </i>'+
    '</a>'+
    '<ul class="treeview-menu">'+
    '<!--   <li><a href="#"><i class="fa fa-circle-o"></i>Promotions</a></li> -->' +
    '<li id="promo_dd_calview_fe"><a href="promo_dd_calview"><i class="fa fa-circle-o"></i> Daily Deals</a></li>'+
    '<li id="promo_ginfo_calview_fe"><a href="promo_aod_calview"><i class="fa fa-circle-o"></i> App of the day</a></li>'+
    '<li id="promo_ginfo_calview_fe"><a href="promo_ginfo_calview"><i class="fa fa-circle-o"></i> General Info</a></li>'+
    '</ul>'+
    '</li>'+
    ' <li class="treeview" id="test_user_fe">'+
    '<a href="test_user">'+
    '<i class="fa fa-user-secret"></i> <span>Test User</span> </i>'+
    '</a>'+
    '</li>'+
    '<li class="treeview" id="config_fe">'+
    '<a href="config">'+
    '<i class="fa fa-cogs"></i> <span>Configuration</span> </i>'+
    '</a>'+
    '</li>'+
    '<li class="treeview" id="AdsConfiguration_fe">'+
    '<a href="">'+
    '<i class="fa fa-adn"></i> <span>Ads Configuration</span><i class="fa fa-angle-left pull-right"> </i>'+
    '</a>'+
    '<ul class="treeview-menu">'+
    '<!--   <li><a href="#"><i class="fa fa-circle-o"></i>Promotions</a></li> -->'+
    '<li id="ads_config_ios_fe"><a href="ads_config_ios"><i class="fa fa-circle-o"></i>ios</a></li>'+
    '<li id="ads_config_android_fe"><a href="ads_config_android"><i class="fa fa-circle-o"></i>Android</a></li>'+
    '</ul>'+
    '</li>'+
    '</ul>';

