<?php
/*
 Plugin Name: Pollphin for Wordpress
 Plugin URI: http://wordpress.org/extend/plugins/wp-pollphin
 Description: Embed Pollphin polls without modifying your template code on every post or page to easily enable a user feedback opportunity!
 Version: 0.9
 Author: Pollphin GmbH
 Author URI: http://www.pollphin.de
 License: GPLv2 
 */

define('OPTION_POLLPHIN_STYLE', 'pollphin_style');
define('OPTION_POLLPHIN_FRONTPAGE', 'pollphin_frontpage');
define('POST_META_POLLPHIN_ID', '_pollphin_poll_id');
define('POST_META_POLLPHIN_STYLE', '_pollphin_style'); //for old < v0.5
define('POLLPHIN_PLUGIN_URL', plugin_dir_url(__FILE__));
define('POLLPHIN_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('POLLPHIN_DEFAULT_CSS', 'default.css');
define('POLLPHIN_CUSTOM_CSS', 'pollphin.css');

$meta_box = array(
  'id' => 'pollphin_meta',
  'title' => 'WP-Pollphin',
  'context' => 'normal',
  'priority' => 'high',
  'fields' => array(
    array(
      'name' => POST_META_POLLPHIN_ID,
      'desc' => 'Pollphin poll ID',
      'id' => POST_META_POLLPHIN_ID,
      'type' => 'text',
      'std' => ''
    )
  )
);

add_action('add_meta_boxes', 'pollphin_meta_box_add');
// backwards compatible
add_action('admin_init', 'pollphin_meta_box_add', 1);
add_action('admin_menu', 'pollphin_admin_menu');
// end
add_action('edit_post', 'pollphin_save_postdata');
add_action('publish_post', 'pollphin_save_postdata');
add_action('edit_page_form', 'pollphin_save_postdata');
add_action('save_post', 'pollphin_save_postdata');
add_filter('the_content', 'pollphin_frontend_data_add', 1);
add_action('wp_print_styles', 'add_stylesheet');

if (function_exists('register_activation_hook')) {
  register_activation_hook(__FILE__, 'pollphin_activate');
}
if (function_exists('register_deactivation_hook')) {
  register_deactivation_hook(__FILE__, 'pollphin_deactivate');
}
if (function_exists('register_uninstall_hook')) {
  register_uninstall_hook(__FILE__, 'pollphin_uninstall');
}

function pollphin_activate()
{
  add_option(OPTION_POLLPHIN_STYLE, POLLPHIN_DEFAULT_CSS);
  add_option(OPTION_POLLPHIN_FRONTPAGE, 0);
}

function pollphin_deactivate()
{
  //do nothing (for now)
}

function pollphin_uninstall()
{
  delete_option(OPTION_POLLPHIN_STYLE);
  delete_option(OPTION_POLLPHIN_FRONTPAGE);

  $allposts = get_posts('numberposts=-1&post_status=any&post_type=any');
  foreach($allposts as $postinfo) {
    delete_post_meta($postinfo->ID, POST_META_POLLPHIN_ID);
    //backwards compatible < 0.5 of wp-pollphin deleting old post_meta pollphin_style
    delete_post_meta($postinfo->ID, POST_META_POLLPHIN_STYLE);
  }
}

function pollphin_meta_box_add()
{
  global $meta_box;

  add_meta_box($meta_box['id'], $meta_box['title'], 'pollphin_meta', 'page', $meta_box['context'], $meta_box['priority']);
  add_meta_box($meta_box['id'], $meta_box['title'], 'pollphin_meta', 'post', $meta_box['context'], $meta_box['priority']);
}

function pollphin_meta()
{
  global $meta_box, $post;

  wp_nonce_field(plugin_basename(__FILE__), 'pollphin_nonce');

  echo '<table>';
  foreach ($meta_box['fields'] as $field) {
    $meta = get_post_meta($post->ID, $field['id'], true);
    echo '<tr>',
    '<th scope="row" style="text-align:left; width:120px;"><label for="', $field['id'], '">', $field['desc'], '</label></th>',
    '<td>';
    switch ($field['type']) {
      case 'text':
        echo '<input type="text" name="', $field['id'], '" id="', $field['id'], '" value="', $meta ? $meta
          : $field['std'], '" size="15" style="width: 150px;" />';
        break;
      case 'textarea':
        echo '<textarea name="', $field['id'], '" id="', $field['id'], '" cols="60" rows="4" style="width:97%">', $meta
          ? $meta : $field['std'], '</textarea>';
        break;
      case 'select':
        echo '<select name="', $field['id'], '" id="', $field['id'], '" style="width: 150px;">';
        foreach ($field['options'] as $option) {
          echo '<option', $meta == $option['value'] || (!$meta && $option['default'] > 0) ? ' selected="selected"'
            : '', ' value="', $option['value'], '"', '>', $option['name'], '</option>';
        }
        echo '</select>';
        break;
      case 'radio':
        foreach ($field['options'] as $option) {
          echo '<input type="radio" name="', $field['id'], '" value="', $option['value'], '"', $meta == $option['value']
            ? ' checked="checked"' : '', ' />', $option['name'];
        }
        break;
      case 'checkbox':
        echo '<input type="checkbox" name="', $field['id'], '" id="', $field['id'], '"', $meta ? ' checked="checked"'
          : '', ' />';
        break;
    }
    echo '</td>',
    '</tr>';
  }
  echo '<tr>',
  '<td>';
  echo '<input type="button" id="reset_pollphin_poll_id" name="reset_pollphin_poll_id" value="remove poll" size="15" onclick="javascript: document.getElementById(\'_pollphin_poll_id\').value=\'\'; return false;"/>';
  echo '</td>',
  '</tr>';
  echo '</table>';
}

function pollphin_save_postdata($post_id)
{
  global $meta_box;

  if (!wp_verify_nonce($_POST['pollphin_nonce'], plugin_basename(__FILE__))) {
    return $post_id;
  }

  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
    return $post_id;
  }

  if ('page' == $_POST['post_type']) {
    if (!current_user_can('edit_page', $post_id))
      return $post_id;
  }
  else {
    if (!current_user_can('edit_post', $post_id))
      return $post_id;
  }

  foreach ($meta_box['fields'] as $field) {
    $old = get_post_meta($post_id, $field['id'], true);
    $new = $_POST[$field['id']];
    if (!empty($new) && $new != $old) {
      if ($field['id'] === "_pollphin_poll_id") {
        if (is_numeric($new) && $new > 0) {
          update_post_meta($post_id, $field['id'], $new);
        }
      }
      else {
        update_post_meta($post_id, $field['id'], $new);
      }
    }
    elseif (empty($new)) {
      delete_post_meta($post_id, $field['id'], $old);
    }
  }
}

function pollphin_frontend_data_add($content)
{
  global $post;

  $pollid = get_post_meta($post->ID, POST_META_POLLPHIN_ID, true);
  if (show_poll($pollid)) {
    $content .= "<script type='text/javascript'>" .
                "var pollphinVars = {\n" .
                "'pollid'       : " . $pollid . ",\n" .
                "'pollphinStyle': \"false\"\n" .
                "}\n" .
                "</script>" .
                "<div id='pollphin_poll_" . $pollid . "' class='pollphincontainer'><a href='http://www.pollphin.de/poll/" .
                $pollid . "'>Mehr Umfragen auf Pollphin.de</a></div>" .
                "<script src='" . POLLPHIN_PLUGIN_URL . "js/pollphin.js' type='text/javascript'></script>";
  }
  return $content;
}

function add_stylesheet()
{
  global $post;

  if (show_poll(get_post_meta($post->ID, POST_META_POLLPHIN_ID, true))) {
    if (get_theme_css_file()) {
      $pollphin_style = get_theme_css_file();
      wp_register_style($pollphin_style, $pollphin_style, array(), false);
    } else {
      $pollphin_style = get_option(OPTION_POLLPHIN_STYLE);
      wp_register_style($pollphin_style, POLLPHIN_PLUGIN_URL . 'styles/' . $pollphin_style, array(), false);
    }
    wp_enqueue_style($pollphin_style);
  }
}

function get_theme_css_file()
{
  if (file_exists(STYLESHEETPATH . '/' . POLLPHIN_CUSTOM_CSS)) {
    return get_stylesheet_directory_uri() . '/' . POLLPHIN_CUSTOM_CSS;
  }
  return false;
}

function pollphin_admin_menu()
{
  add_options_page('WP-Pollphin Options', 'Pollphin', 'manage_options', 'wp-pollphin-manage', 'pollphin_plugin_options');
}

function pollphin_plugin_options()
{
  if (!current_user_can('manage_options')) {
    wp_die(__('You do not have sufficient permissions to access this page.'));
  }

  if (isset($_POST['pollphin_update'])) {
    $pollphin_style = $_POST['pollphin_style'];
    $pollphin_frontpage = $_POST['pollphin_frontpage'];
    update_option(OPTION_POLLPHIN_STYLE, $pollphin_style);
    update_option(OPTION_POLLPHIN_FRONTPAGE, $pollphin_frontpage);
  }
  else {
    $pollphin_style = get_option(OPTION_POLLPHIN_STYLE);
    $pollphin_frontpage = get_option(OPTION_POLLPHIN_FRONTPAGE);
  }
  ?>

  <form method="post" action="options-general.php?page=wp-pollphin-manage">
    <div class="wrap">
      <h2>Pollphin for WordPress Settings</h2>
      <table class="form-table" style="margin-top: 10px;">
        <tr>
          <th scope="row" valign="top">
            <label for="pollphin_style">Pollphin Style:</label>
          </th>
          <td>
            <?php if (!get_theme_css_file()) { ?>
            <select name="pollphin_style" id="pollphin_style" style="width: 150px;">
              <?php foreach (read_styles() as $style) { ?>
              <option value="<?=$style?>" <?php if ($pollphin_style == $style) {echo "selected=\"selected\"";} ?>><?=$style?></option>
              <?php } ?>
            </select>
            <span class="setting-description">Select the default CSS for this blog.</span>
            <?php }  else { ?>
            <span class="setting-description">Found a <em>pollphin.css</em> style in your theme folder.</span>
            <?php } ?>
          </td>
        </tr>
        <tr>
          <th scope="row" valign="top">
            <label for="pollphin_style">Poll Display:</label>
        </th>
        <td>
          <input type="radio" value="1" name="pollphin_frontpage" <?php if ($pollphin_frontpage == 1) {echo "checked=\"checked\"";} ?>/>
          <span class="setting-description">Right after an excerpt.</span>
          <br/>
          <input type="radio" value="0" name="pollphin_frontpage" <?php if ($pollphin_frontpage == 0) {echo "checked=\"checked\"";} ?>/>
          <span class="setting-description">Only at the "Single Post View" (default).</span>
        </td>
      </tr>
      </table>
      <p class="submit">
        <input name="pollphin_update" value="Update Options" type="submit" class="button-primary"/>
      </p>
      <table>
        <tr>
          <th width="30%" valign="top" style="padding-top: 10px; text-align:left;" colspan="2">
            More Information and Support
          </th>
        </tr>
        <tr>
          <td colspan="2">
            <p>Check our links for more information and comment there if you have any problems / questions /
              suggestions.</p>
            <ul>
              <li><a href="http://www.pollphin.de">Pollphin Home Page</a></li>
              <li><a href="http://wordpress.org/extend/plugins/wp-pollphin">WordPress Plugin Page</a></li>
              <li><a href="http://wordpress.org/tags/wp-pollphin?forum_id=10">Plugin Forum</a></li>
              <li><a href="http://wordpress.org/extend/plugins/wp-pollphin/faq">FAQs (including how to create own styles)</a></li>
            </ul>
          </td>
        </tr>
      </table>
    </div>
  </form>
<?php

}

function read_styles()
{
  $handle = opendir(POLLPHIN_PLUGIN_DIR . 'styles');
  while (false !== ($file = readdir($handle))) {
    if (end(explode(".", $file)) == 'css') {
      $files[] = $file;
    }
  }
  closedir($handle);
  return $files;
}

function show_poll($pollid) {
  return $pollid > 0 && (is_page() || (get_option(OPTION_POLLPHIN_FRONTPAGE) > 0 || is_single()));
}
?>
