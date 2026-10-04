# =============================================================================
#  Prépare la photo d'arrière-plan du bandeau d'accueil :
#   - recadrage au ratio voulu (16:9 par défaut, centré)
#   - redimensionnement + encodage JPEG réglé pour une connexion lente
#
#  Utilisation (Windows) :
#    powershell -ExecutionPolicy Bypass -File scripts/prepare-hero.ps1 -Source "C:\chemin\photo.jpg"
#    powershell -ExecutionPolicy Bypass -File scripts/prepare-hero.ps1 -Source photo.jpg -Quality 55 -Width 960
# =============================================================================
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [int]$Width = 1024,
  [int]$Height = 576,
  [int]$Quality = 62,
  [string]$Out = 'src/assets/hero.jpg'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outPath = Join-Path $root $Out
New-Item -ItemType Directory -Force -Path (Split-Path $outPath -Parent) | Out-Null

$img = [System.Drawing.Image]::FromFile($Source)
"{0} : {1}x{2}" -f (Split-Path $Source -Leaf), $img.Width, $img.Height | Write-Host

# --- Recadrage centré au ratio demandé -------------------------------------
$targetRatio = $Width / $Height
$sourceRatio = $img.Width / $img.Height
if ($sourceRatio -gt $targetRatio) {
  $cropW = [int][Math]::Round($img.Height * $targetRatio)
  $cropH = $img.Height
} else {
  $cropW = $img.Width
  $cropH = [int][Math]::Round($img.Width / $targetRatio)
}
$cropX = [int](($img.Width - $cropW) / 2)
$cropY = [int](($img.Height - $cropH) / 2)

# --- Redimensionnement puis encodage ---------------------------------------
$canvas = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

$wrap = New-Object System.Drawing.Imaging.ImageAttributes
$wrap.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
$dest = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
$g.DrawImage($img, $dest, $cropX, $cropY, $cropW, $cropH, [System.Drawing.GraphicsUnit]::Pixel, $wrap)
$g.Dispose()

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
$canvas.Save($outPath, $codec, $params)
$canvas.Dispose()
$img.Dispose()

"{0} : {1}x{2} ({3} Ko)" -f $Out, $Width, $Height, [Math]::Round((Get-Item $outPath).Length / 1KB, 1) | Write-Host
"Terminé." | Write-Host
