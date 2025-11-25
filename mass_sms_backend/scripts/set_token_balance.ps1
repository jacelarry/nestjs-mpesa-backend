# PowerShell script to set token balance for a user
# Usage: .\set_token_balance.ps1 <user_id> <token_type> <balance>

param(
    [Parameter(Mandatory=$true)][int]$UserId,
    [Parameter(Mandatory=$true)][string]$TokenType,
    [Parameter(Mandatory=$true)][int]$Balance
)

$command = "INSERT INTO user_tokens (user_id, balance, token_type) VALUES ($UserId, $Balance, '$TokenType') ON CONFLICT (user_id, token_type) DO UPDATE SET balance = $Balance;"

# Use single quotes for the outer string and escape inner quotes for SQL
$dockerCmd = 'docker exec -i mass_sms_backend-db-1 psql -U postgres -d mass_sms -c "' + $command + '"'
Invoke-Expression $dockerCmd
