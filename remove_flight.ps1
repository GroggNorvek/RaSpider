$lines = Get-Content 'movement.js'
$output = @()
$skipMode = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Start skipping when we find the direct movement comment
    if ($line -match '^\s+//\s+MOVIMIENTO DIRECTO') {
        $skipMode = $true
        #  Add replacement code instead
        $output += ""
        $output += "            // NO MÁS VUELO - Solo constrain a superficie"
        $output += "            this.movement.constrainToSurface(this.spider);"
        $output += "            return true;"
        continue
    }
    
    # Stop skipping after the return true; line
    if ($skipMode -and $line.Trim() -eq 'return true;') {
        $skipMode = $false
        continue  # Skip this line
    }
    
    # Add line if not in skip mode
    if (-not $skipMode) {
        $output += $line
    }
}

$output | Set-Content 'movement.js' -Encoding UTF8
Write-Host "✅ Direct movement code removed successfully!"
Write-Host "⚠️ Please refresh the browser (F5) to test"
