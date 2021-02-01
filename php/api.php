<?php
require_once('settings.php');
function get_data() {
    $input = fopen('php://input', 'r');
    $buffer = '';
    while ($data = fread($input, 1024)) {
        $buffer .= $data;
    }
    return $buffer;
}

function get_mysqli() {
    $mysqli = new mysqli(
        conf('db_host'),
        conf('db_user'),
        conf('db_pass'),
        conf('db_name')
    );
    if ($mysqli->connect_errno) {
        printf('Connect failed: %s\n', $mysqli->connect_error);
        exit();
    }
    $mysqli->set_charset('utf8mb4');
    return $mysqli;
}

function get_uuid($mysqli) {
    $result = $mysqli->query('SELECT HEX(ORDERED_UUID(UUID())) as uuid');
    if ($result) {
        if ($row = $result->fetch_assoc()) {
            $result->close();
            return $row['uuid'];
        }
        $result->close();
    }
    throw new Exception('No database');
}

function auth() {
    $h = 'HTTP_X_AUTH';
    if (isset($_SERVER[$h]) && $_SERVER[$h] === conf('password')) {
        return true;
    }
    throw new Exception('unauthorized');
}

function create($data) {
    auth();
    $mysqli = get_mysqli();
    $uuid = get_uuid($mysqli);
    $decoded = json_decode($data, true);
    $decoded['id'] = $uuid;
    $data = json_encode($decoded, JSON_UNESCAPED_UNICODE);
    $stmt = $mysqli->prepare('INSERT INTO recepies (uuid, data) VALUES (UNHEX(?), ?)');
    $stmt->bind_param('ss', $uuid, $data);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
    echo json_encode(['data' => $decoded], JSON_UNESCAPED_UNICODE);
}

function update($data) {
    auth();
    $mysqli = get_mysqli();
    $decoded = json_decode($data, true);
    $uuid = $decoded['id'];
    $stmt = $mysqli->prepare('UPDATE recepies SET data = ? WHERE uuid = UNHEX(?)');
    $stmt->bind_param("ss", $data, $uuid);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
    echo json_encode(['data' => $decoded], JSON_UNESCAPED_UNICODE);
}

function delete($uuid) {
    auth();
    $mysqli = get_mysqli();
    $stmt = $mysqli->prepare('DELETE FROM recepies WHERE uuid = UNHEX(?)');
    $stmt->bind_param("s", $uuid);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
}

function get($id) {
    $mysqli = get_mysqli();
    if ($result = $mysqli->query('SELECT data FROM recepies')) {
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[] = json_decode($row['data']);
        }
        $result->close();
        echo json_encode(['data' => $data]);
        return;
    }
    throw new Exception('No database');
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        update(get_data());
        break;
    case 'POST':
        create(get_data());
        break;
    case 'DELETE':
        delete($_GET['id'] ?? null);
        break;
    default:
        get($_GET['id'] ?? null);
    }
} catch(Exception $e) {
    echo json_encode([ 'error' => $e->getMessage() ]);
}
