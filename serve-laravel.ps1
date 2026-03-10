param(
    [int]$StartPort = 9000,
    [int]$EndPort = 9010,
    [string]$BindAddress = "127.0.0.1"
)

Write-Host "Looking for free port between $StartPort and $EndPort on $BindAddress..."

$freePort = $null

for ($p = $StartPort; $p -le $EndPort; $p++) {
    $inUse = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq $p }

    if (-not $inUse) {
        $freePort = $p
        break
    }
}

if (-not $freePort) {
    Write-Host "No free port found between $StartPort and $EndPort." -ForegroundColor Red
    exit 1
}

Write-Host "Using port $freePort. Starting: php artisan serve --host=$BindAddress --port=$freePort`n" -ForegroundColor Green

php artisan serve --host=$BindAddress --port=$freePort