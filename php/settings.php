<?php

function conf($name) {
    $config = [
        'password' => 'ABC123',
        'db_host' => 'db',
        'db_user' => 'devuser',
        'db_pass' => 'devpass',
        'db_name' => 'test_db'
    ];
    return $config[name];
}
