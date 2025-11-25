$base = 'http://localhost:3000'

# Get dynamic ID from first bebida
Write-Host "=== Fetching dynamic bebida ID ===" -ForegroundColor Cyan
$bebidas = Invoke-RestMethod -Uri "$base/bebidas"
$id = $bebidas[0].id
Write-Host "Using bebida ID: $id" -ForegroundColor Green
Write-Host ""

function Do-Get([string]$path) {
  $uri = "$base$path"
  Write-Host "=> GET $uri"
  try {
    $r = Invoke-RestMethod -Method Get -Uri $uri -ErrorAction Stop
    $r | ConvertTo-Json -Depth 5 | Write-Host
  } catch {
    Write-Host "ERROR: $($_.Exception.Message)"
  }
  Start-Sleep -Milliseconds 500
}

function Do-Post([string]$path, $body = $null) {
  $uri = "$base$path"
  Write-Host "=> POST $uri"
  try {
    if ($body -ne $null) {
      $r = Invoke-RestMethod -Method Post -Uri $uri -ContentType 'application/json' -Body ($body | ConvertTo-Json) -ErrorAction Stop
    } else {
      $r = Invoke-RestMethod -Method Post -Uri $uri -ErrorAction Stop
    }
    $r | ConvertTo-Json -Depth 5 | Write-Host
  } catch {
    Write-Host "ERROR: $($_.Exception.Message)"
  }
  Start-Sleep -Milliseconds 500
}

function Do-Delete([string]$path) {
  $uri = "$base$path"
  Write-Host "=> DELETE $uri"
  try {
    $r = Invoke-RestMethod -Method Delete -Uri $uri -ErrorAction Stop
    $r | ConvertTo-Json -Depth 5 | Write-Host
  } catch {
    Write-Host "ERROR: $($_.Exception.Message)"
  }
  Start-Sleep -Milliseconds 500
}

# 1. Get single bebida
Do-Get "/bebidas/$id"

# 2. Increase stock by 2 (query string to avoid escaping issues)
Do-Post "/bebidas/$id/increase?amount=2"

# 3. Decrease stock by 1
Do-Post "/bebidas/$id/decrease?amount=1"

# 4. List all bebidas
Do-Get "/bebidas"

# 5. Total stock
Do-Get "/bebidas/stock"

# 6. Total stock by brand
Do-Get "/bebidas/stock/brand/Fanta"

# 7. Select beverage (pushes select cmd)
Do-Post "/bebidas/$id/select"

# 8. ESP32 next (should return select)
Do-Get "/esp32/next"

# 9. Request release by brand
Do-Post "/marcas/Fanta/release"

# 10. ESP32 next (should return release)
Do-Get "/esp32/next"

# 11. List marcas
Do-Get "/marcas"

# 12. Create test marca and capture ID
Write-Host "=> POST $base/marcas"
$newMarca = Invoke-RestMethod -Method Post -Uri "$base/marcas" -ContentType 'application/json' -Body (@{ name = 'TesteMarca' } | ConvertTo-Json)
$newMarca | ConvertTo-Json -Depth 5 | Write-Host
$marcaId = $newMarca.id
Start-Sleep -Milliseconds 500

# 13. Delete test marca by ID
Do-Delete "/marcas/$marcaId"

Write-Host 'Test script finished.'
