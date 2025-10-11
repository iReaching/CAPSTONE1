<?php
/**
 * Minimal environment loader so PHP endpoints can share the same `.env` files
 * as the Vite front-end.
 */

if (!function_exists('env_loader_bootstrap')) {
    /**
     * Determines if the current request is running on a local development host.
     */
    function env_loader_is_local_host(): bool
    {
        $host = strtolower(($_SERVER['HTTP_HOST'] ?? '') . ' ' . ($_SERVER['SERVER_NAME'] ?? ''));
        return strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false;
    }

    /**
     * Parses a single KEY=VALUE line into a tuple.
     *
     * @return array{0:string,1:string}|null
     */
    function env_loader_parse_line(string $line): ?array
    {
        $trimmed = trim($line);
        if ($trimmed === '' || $trimmed[0] === '#' || $trimmed[0] === ';') {
            return null;
        }
        if (strncmp($trimmed, 'export ', 7) === 0) {
            $trimmed = trim(substr($trimmed, 7));
        }
        $parts = explode('=', $trimmed, 2);
        if (count($parts) !== 2) {
            return null;
        }

        $key = trim($parts[0]);
        if ($key === '') {
            return null;
        }

        $value = trim($parts[1]);
        if ($value !== '') {
            $first = $value[0];
            $last = substr($value, -1);
            if ($first === '"' && $last === '"') {
                $value = stripcslashes(substr($value, 1, -1));
            } elseif ($first === "'" && $last === "'") {
                $value = substr($value, 1, -1);
            } else {
                // Remove inline comments starting with unescaped #
                $hashPos = strpos($value, '#');
                if ($hashPos !== false) {
                    $beforeHash = rtrim(substr($value, 0, $hashPos));
                    if ($beforeHash !== '') {
                        $value = $beforeHash;
                    }
                }
            }
        }

        return [$key, $value];
    }

    /**
     * Applies a key/value to the current environment.
     */
    function env_loader_set(string $key, string $value, bool $overrideExisting): void
    {
        if (!$overrideExisting && getenv($key) !== false) {
            return;
        }
        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }

    /**
     * Loads and applies the contents of an env file.
     */
    function env_loader_load_file(string $path, bool $overrideExisting = true): void
    {
        if (!is_file($path) || !is_readable($path)) {
            return;
        }

        $handle = fopen($path, 'r');
        if (!$handle) {
            return;
        }

        while (($line = fgets($handle)) !== false) {
            $parsed = env_loader_parse_line($line);
            if ($parsed) {
                env_loader_set($parsed[0], $parsed[1], $overrideExisting);
            }
        }

        fclose($handle);
    }

    /**
     * Loads environment variables once per request.
     */
    function env_loader_bootstrap(): void
    {
        static $loaded = false;
        if ($loaded) {
            return;
        }
        $loaded = true;

        $root = dirname(__DIR__);
        $candidates = [
            $root . DIRECTORY_SEPARATOR . '.env',
            $root . DIRECTORY_SEPARATOR . '.env.local',
        ];

        foreach ($candidates as $file) {
            env_loader_load_file($file, true);
        }

        $appEnv = getenv('APP_ENV') ?: getenv('APPLICATION_ENV') ?: '';
        if ($appEnv === '') {
            $appEnv = env_loader_is_local_host() ? 'development' : 'production';
        }
        $appEnv = strtolower($appEnv);

        $envSpecific = [
            $root . DIRECTORY_SEPARATOR . ".env.{$appEnv}",
            $root . DIRECTORY_SEPARATOR . ".env.{$appEnv}.local",
        ];

        foreach ($envSpecific as $file) {
            env_loader_load_file($file, true);
        }
    }

    env_loader_bootstrap();
}
