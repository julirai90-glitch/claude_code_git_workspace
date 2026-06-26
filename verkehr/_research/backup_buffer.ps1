# Backup des n8n-Daten-Buffers (Totalverlust-Schutz fuer das Verkehrsdashboard).
# Holt latest/today/baseline/history vom Webhook und speichert sie mit Zeitstempel.
# PowerShell nutzt den Windows-Cert-Store -> kein Norton-SSL-Problem.
# Manuell ausfuehrbar oder per Windows-Aufgabenplanung taeglich planen.
$ErrorActionPreference = "Stop"
$base = "https://n8n.julianreich.ch/webhook/verkehr-data?f="
$dir  = "C:\Users\julir\Claude_Code_Workspace\Wissen\verkehr-backups"
New-Item -ItemType Directory -Force $dir | Out-Null
$ts = Get-Date -Format "yyyy-MM-dd_HHmm"
foreach ($f in "latest","today","baseline","history") {
    try {
        $r = Invoke-WebRequest -Uri "$base$f" -UseBasicParsing -TimeoutSec 60
        $out = Join-Path $dir "${ts}_$f.json"
        [IO.File]::WriteAllText($out, $r.Content, [Text.Encoding]::UTF8)
        Write-Host "ok  $f -> $out ($($r.Content.Length) Bytes)"
    } catch {
        Write-Host "FAIL $f : $_"
    }
}
# Backups aelter als 30 Tage aufraeumen
Get-ChildItem $dir -Filter *.json |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force
Write-Host "Backup fertig: $dir"
