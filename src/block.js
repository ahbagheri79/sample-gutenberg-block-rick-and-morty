(function( blocks, editor, components, element, wp ) {
    var el = element.createElement;
    var useState = element.useState;
    var useEffect = element.useEffect;
    var Button = components.Button;

    blocks.registerBlockType( 'rick-and-morty/block', {
        title: 'Rick and Morty Characters',
        icon: 'smiley',
        category: 'widgets',
        attributes: {
            characters: {
                type: 'array',
                default: [],
            },
            page: {
                type: 'number',
                default: 1,
            },
        },

        edit: function( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            const [ loading, setLoading ] = useState( false );
            const [ hasMore, setHasMore ] = useState( true );

            useEffect( function() {
                if ( ! attributes.page ) return;
                setLoading( true );

                fetch( `https://rickandmortyapi.com/api/character/?page=${ attributes.page }` )
                    .then( function( response ) {
                        return response.json();
                    })
                    .then( function( data ) {
                        setAttributes( {
                            characters: data.results,
                        } );
                        setHasMore( data.info.next !== null );
                        setLoading( false );
                    } );
            }, [ attributes.page ] );

            return el( 'div', {},
                el( 'h3', {}, 'کارکترهای ریک و مورتی' ),
                el( 'div', { className: 'characters' },
                    attributes.characters.map( function( character ) {
                        return el( 'div', { className: 'character-card', key: character.id },
                            el( 'img', { src: character.image, alt: character.name } ),
                            el( 'h4', {}, character.name ),
                            el( 'p', {}, character.status )
                        );
                    } )
                ),
                loading && el( 'p', {}, 'در حال بارگذاری ...' ),
                hasMore && ! loading && el( Button, { isPrimary: true, onClick: function() { setAttributes( { page: attributes.page + 1 } ); } }, 'Load More' )
            );
        },

        save: function( props ) {
            var attributes = props.attributes;
            return (
                el( 'div', {},
                    el( 'div', { className: 'characters' },
                        attributes.characters.map( function( character ) {
                            return el( 'div', { className: 'character-card', key: character.id },
                                el( 'img', { src: character.image, alt: character.name } ),
                                el( 'h4', {}, character.name ),
                                el( 'p', {}, character.status )
                            );
                        } )
                    ),
                    attributes.page > 1 && el( 'button', {
                        className: 'load-more-button',
                        onClick: function() {
                            setLoading(true);
                            var nextPage = attributes.page + 1;

                            jQuery.ajax({
                                url: wp.ajax_url,
                                method: 'POST',
                                data: {
                                    action: 'load_more_characters',
                                    page: nextPage,
                                },
                                success: function(response) {
                                    var data = JSON.parse(response);
                                    setAttributes({
                                        characters: [...attributes.characters, ...data.results],
                                        page: nextPage,
                                    });
                                    setLoading(false);
                                },
                                error: function() {
                                    setLoading(false);
                                }
                            });
                        }
                    }, 'Load More' )
                )
            );
        },
    });
})( window.wp.blocks, window.wp.editor, window.wp.components, window.wp.element, window.wp );


(function( blocks, editor, components, element, wp ) {
    var el = element.createElement;
    var Button = components.Button;

    blocks.registerBlockType( 'custom/load-more-button', {
        title: 'Load More Button',
        icon: 'button',
        category: 'widgets',

        edit: function( props ) {
            const handleClick = () => {
                wp.ajax.post( 'load_more_characters' ).done( function( response ) {
                    if ( response.success ) {
                        const container = document.querySelector( '.rick-and-morty-characters' );
                        if ( container ) {
                            response.data.forEach( character => {
                                const characterCard = el(
                                    'div',
                                    { className: 'rick-and-morty-character-card' },
                                    el( 'img', { src: character.image, alt: character.name } ),
                                    el( 'h3', null, character.name ),
                                    el( 'p', null, character.status )
                                );

                                container.appendChild( characterCard );
                            });
                        }
                    } else {
                        console.log( 'Failed to load characters' );
                    }
                }).fail( function( error ) {
                    console.log( 'Error:', error );
                });
            };

            return el(
                Button,
                {
                    isPrimary: true,
                    onClick: handleClick
                },
                'Load More'
            );
        },

        save: function() {
            return el(
                'button', 
                {
                    className: 'load-more-button',
                    onClick: function() {
                        // ارسال درخواست AJAX به سرور برای بارگذاری بیشتر
                        wp.ajax.post( 'load_more_characters' ).done( function( response ) {
                            // بررسی موفقیت درخواست
                            if ( response.success ) {
                                const container = document.querySelector( '.rick-and-morty-characters' );
                                if ( container ) {
                                    response.data.forEach( character => {
                                        const characterCard = el(
                                            'div',
                                            { className: 'rick-and-morty-character-card' },
                                            el( 'img', { src: character.image, alt: character.name } ),
                                            el( 'h3', null, character.name ),
                                            el( 'p', null, character.status )
                                        );
        
                                        container.appendChild( characterCard );
                                    });
                                }
                            } else {
                                console.log( 'Failed to load characters' );
                            }
                        }).fail( function( error ) {
                            console.log( 'Error:', error );
                        });
                    }
                },
                'Load More'
            );
        }
    });
})( window.wp.blocks, window.wp.editor, window.wp.components, window.wp.element, window.wp );
