<?php
/**
 * Plugin Name: Rick and Morty Block
 * Description: A Gutenberg block to display characters from the Rick and Morty API.
 * Version: 0.1 beta (Test Version)
 * Author: Amir Hossein Bagheri
 * Text Domain: rick-and-morty-block
 */

function register_rick_and_morty_block() {
    if ( function_exists( 'register_block_type' ) ) {
        register_block_type( 'rick-and-morty/block', array(
            'editor_script' => 'rick-and-morty-block',  
            'editor_style'  => 'rick-and-morty-block-style', 
            'render_callback' => 'render_rick_and_morty_block', 
        ) );
    }
}

function render_rick_and_morty_block( $attributes ) {
    $api_url = 'https://rickandmortyapi.com/api/character';
    $response = wp_remote_get( $api_url );

    if ( is_wp_error( $response ) ) {
        return '<div class="rick-and-morty-block">Error fetching data.</div>';
    }

    $data = wp_remote_retrieve_body( $response );
    $characters = json_decode( $data, true );
    $output = '<div class="rick-and-morty-characters">';
    
    if ( isset( $characters['results'] ) ) {
        foreach ( $characters['results'] as $character ) {
            $output .= '<div class="rick-and-morty-character-card">';
            $output .= '<img src="' . esc_url( $character['image'] ) . '" alt="' . esc_attr( $character['name'] ) . '">';
            $output .= '<h3>' . esc_html( $character['name'] ) . '</h3>';
            $output .= '<p>' . esc_html( $character['status'] ) . '</p>';
            $output .= '</div>';
        }
    } else {
        $output .= '<p>No characters found.</p>';
    }

    $output .= '</div>';

    return $output;
}

add_action( 'init', 'register_rick_and_morty_block' );
add_action( 'enqueue_block_editor_assets', 'rick_and_morty_block_assets' );


function rick_and_morty_block_assets() {
    wp_enqueue_script(
        'rick-and-morty-block',
        plugin_dir_url( __FILE__ ) . 'src/block.js',
        array( 'wp-blocks', 'wp-editor', 'wp-components', 'wp-element' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'src/block.js' ),
        true
    );

    wp_enqueue_style(
        'rick-and-morty-block-style',
        plugin_dir_url( __FILE__ ) . 'src/style.css',
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'src/style.css' )
    );
}
function add_module_to_script( $tag, $handle ) {
    if ( 'rick-and-morty-block' === $handle ) {
        $tag = str_replace( 'type="text/javascript"', 'type="module"', $tag );
    }
    return $tag;
}

function set_rick_and_morty_page() {
    if( isset( $_GET['page'] ) && is_numeric( $_GET['page'] ) ) {
        $page = $_GET['page'];
    } else {
        $page = 1; 
    }
    return $page;
}

add_filter( 'rick_and_morty_page', 'set_rick_and_morty_page' );

function load_more_characters() {
    $page = isset($_POST['page']) ? intval($_POST['page']) : 1;

    $response = wp_remote_get("https://rickandmortyapi.com/api/character/?page={$page}");
    $data = wp_remote_retrieve_body($response);
    $data = json_decode($data, true);

    if ( ! empty($data['results']) ) {
        echo json_encode($data);
    }

    wp_die(); 
}
add_action('wp_ajax_load_more_characters', 'load_more_characters');
add_action('wp_ajax_nopriv_load_more_characters', 'load_more_characters');
