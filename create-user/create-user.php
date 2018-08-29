<?php
require_once('../wp-load.php');

$data = json_decode(file_get_contents('php://input'));

$userdata = [
  'user_login' => $data->row->email,
  'user_email' => $data->row->email,
  'user_pass' => randomPassword(12,5,"lower_case,upper_case,numbers")[0],
  //'user_pass' => randomPassword(12,5,"lower_case,upper_case,numbers,special_symbols")[0],
  'first_name' => $data->row->clientName,
  'last_name' => $data->row->clientLastName,
  'role' => 'customerregistered',
];

add_filter( 'wp_mail_from', 'my_mail_from' );
function my_mail_from( $email ) {
  return "info@dreamwhite.ru";
}

$to = $userdata['user_email'];
$subject = 'Регистрация на сайте dreamwhite.ru';
$body = "Ваши данные для входа: " . "\nЛогин: " . $userdata['user_login'] . "\nПароль: " . $userdata['user_pass'];

$message = '<html><body>';
$message .= '<h3>Ваши данные для входа:</h3>';
$message .= '<p>Логин: ' . $userdata['user_login'] . '</p>';
$message .= '<p>Пароль: ' . $userdata['user_pass'] . '</p>';
$message .= '<p><a href="https://dreamwhite.ru/my-account/">Ссылка для входа</a></p>';
$message .= '</body></html>';

$headers = [
  'Content-Type: text/html; charset=UTF-8',
  'From: DreamWhite <info@dreamwhite.ru>',
  'MIME-Version: 1.0',
  'Content-Type: text/html'
];

$user_id = wp_insert_user( $userdata );
wp_mail($to,$subject,$message,$headers);

//wp_mail( $userdata['user_email'], 'Регистрация на сайте dreamwhite.ru', 'Ваши данные для входа: ' . "\nЛогин: " . $userdata['user_login'] . "\nПароль: " . $userdata['user_pass']);
//wp_new_user_notification( $user_id, $user_data->user_pass );

  function randomPassword($length,$count, $characters) {

// $length - the length of the generated password
// $count - number of passwords to be generated
// $characters - types of characters to be used in the password

// define variables used within the function
    $symbols = array();
    $passwords = array();
    $used_symbols = '';
    $pass = '';

// an array of different character types
    $symbols["lower_case"] = 'abcdefghijklmnopqrstuvwxyz';
    $symbols["upper_case"] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $symbols["numbers"] = '1234567890';
    $symbols["special_symbols"] = '!?~@#-_+<>[]{}';

    $characters = explode(",",$characters); // get characters types to be used for the passsword
    foreach ($characters as $key=>$value) {
      $used_symbols .= $symbols[$value]; // build a string with all characters
    }
    $symbols_length = strlen($used_symbols) - 1; //strlen starts from 0 so to get number of characters deduct 1

    for ($p = 0; $p < $count; $p++) {
      $pass = '';
      for ($i = 0; $i < $length; $i++) {
        $n = rand(0, $symbols_length); // get a random character from the string with all characters
        $pass .= $used_symbols[$n]; // add the character to the password string
      }
      $passwords[] = $pass;
    }

    return $passwords; // return the generated password
  }

