(function($) {
    //If has browserstorage
    if (typeof(Storage) !== "undefined") {
        //Init variables
        var page = parseInt(sessionStorage.getItem("load_product_current_page"));
        var scrollpos=sessionStorage.getItem("load_product_scroll_pos");
        var total_pages=parseInt(ajax_pagenation_custom['total_pages']);
        var page_number_key;
        var page_url;
        var current_url=ajax_pagenation_custom['next_page'];
        var url_array=current_url.split('/');
        for (var key in url_array) {
            if(url_array[key]==='page'){
                page_number_key=parseInt(key)+1;
                break;
            }
        }

        /*Remove the scrollRestoration in history so that we can decide the scrolling ourselves*/
        if (jQuery('body').hasClass('post-type-archive-product') || jQuery('body').hasClass('tax-product_cat')) {
            if('scrollRestoration' in history) {
                // Back off, browser, I got this...
                history.scrollRestoration='manual';
            }
        }

        $(window).on('scroll', function(){
            sessionStorage.setItem("load_product_scroll_pos", $(window).scrollTop());
        });

        //Init, wait a while for localization data.
        setTimeout(function() {
            //If default or reset.
            if( page===null || ajax_pagenation_custom['reset'] || sessionStorage.getItem("load_product_last_url")!==current_url ){
                page=1;
                //Save reset page
                sessionStorage.setItem("load_product_current_page", page);
            }
            //Save this URL.
            sessionStorage.setItem("load_product_last_url", current_url);

            //Back button pressed.
            if (page!==1){
                LoadMoreContent(2,page,true);

                /*Move user to middle of page */
                $middleofPage = ($('#primary').outerHeight() / 2);
                $('html,body').scrollTop($middleofPage);
            }

            /*If there are no more products, remove button*/
            if (page == total_pages) {
                noMoreProducts();
            }

        }, 50);

        //SetScroll
        function setScrollOnPage() {
            $('html,body').animate({ scrollTop: scrollpos }, 600);
        }

        //When there are no more products More products
        function noMoreProducts() {
            $('.load-more.button').hide();
        }

        //Event handler, save page to session with ajax
        $(".load-more").click(function() {
            //Add another page
            page=parseInt(page)+1;

            sessionStorage.setItem("load_product_current_page", page);
            //Load on frontend
            LoadMoreContent(page,page,false);

        });

        //Load more products
        function LoadMoreContent(current,page,scroll) {
            //If less or same as last total number of pages
            if (current<=total_pages) {

                //Assemble URL
                url_array[page_number_key]=current.toString();
                page_url=url_array.join('/');

                //Append content of URL
                $(".products").append($('<div class="new-content"></div>').load(page_url + " .products .product", function() {

                    $(".new-content .product").css('display','none'); //Hide the new products until they're loaded
                    /*Append the new products to the main div*/
                    $(".new-content .product").appendTo(".products");
                    $(this).remove(); //Remove the old div
                    $(".products li").fadeIn('3000');

                    //Increment
                    current++;
                    //If next page is one of the ones that should be loaded, run this function again.
                    if(current <= page){
                        LoadMoreContent(current,page,scroll);
                    }else{ /*Last page (all pages have been loaded)*/
                        if(scroll){
                            setScrollOnPage();
                        }

                        /*Load Add to Cart script*/
                        $.ajaxSetup({ cache: true });
                        $.getScript( "/add-to-cart.min.js", function () {});
                        $.getScript( "/add-to-cart-variation.min.js", function () {});
                    }


                }));

            } else {
                noMoreProducts();
            }
        }


    }
})(jQuery);
