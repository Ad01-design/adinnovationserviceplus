# =============================================================================
#  Prépare les fichiers à partir du logo source (JPG) :
#   - src/assets/logo.png   : logo détouré (marges blanches supprimées)
#   - public/icons/*.png    : icônes d'installation, à partir du monogramme
#
#  Utilisation (Windows, une seule fois) :
#    powershell -ExecutionPolicy Bypass -File scripts/prepare-logo.ps1 -Source "C:\chemin\logo.jpg"
# =============================================================================
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [int]$LogoHeight = 100
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Runtime.InteropServices

$root = Split-Path -Parent $PSScriptRoot
$iconsDir = Join-Path $root 'public\icons'
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

function Load-Bitmap([string]$path) {
  $img = [System.Drawing.Image]::FromFile($path)
  $bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
  $g.Dispose(); $img.Dispose()
  return $bmp
}

function Get-Pixels([System.Drawing.Bitmap]$bmp) {
  $rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = New-Object byte[] ($data.Stride * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  $bmp.UnlockBits($data)
  return @{ Bytes = $bytes; Stride = $data.Stride }
}

function New-Graphics([System.Drawing.Bitmap]$bmp) {
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  return $g
}

$wrap = New-Object System.Drawing.Imaging.ImageAttributes
$wrap.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)

# Le logo est en aplats : on lisse (agrandissement en deux temps) puis on réduit
# le nombre de niveaux par canal. Sans cela, le bruit JPEG fait exploser le PNG
# (500 Ko pour une icône). Résultat ici : quelques kilo-octets.
function New-SmoothMark([System.Drawing.Bitmap]$bmp, [int]$x, [int]$y, [int]$size, [int]$work) {
  $small = New-Object System.Drawing.Bitmap($work, $work, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = New-Graphics $small
  $dest = New-Object System.Drawing.Rectangle(0, 0, $work, $work)
  $g.DrawImage($bmp, $dest, $x, $y, $size, $size, [System.Drawing.GraphicsUnit]::Pixel, $wrap)
  $g.Dispose()
  return $small
}

function Set-Posterize([System.Drawing.Bitmap]$bmp, [int]$step) {
  $rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = New-Object byte[] ($data.Stride * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  for ($i = 0; $i -lt $bytes.Length; $i += 4) {
    for ($c = 0; $c -lt 3; $c++) {
      $v = [Math]::Round($bytes[$i + $c] / $step) * $step
      if ($v -gt 255) { $v = 255 }
      $bytes[$i + $c] = [byte]$v
    }
  }
  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  $bmp.UnlockBits($data)
}

$src = Load-Bitmap $Source
"{0} : {1}x{2}" -f (Split-Path $Source -Leaf), $src.Width, $src.Height | Write-Host

# --- 1. Détourage : boîte englobante des pixels non blancs -------------------
$px = Get-Pixels $src
$minX = $src.Width; $minY = $src.Height; $maxX = -1; $maxY = -1
$threshold = 235

for ($y = 0; $y -lt $src.Height; $y++) {
  $row = $y * $px.Stride
  for ($x = 0; $x -lt $src.Width; $x++) {
    $i = $row + $x * 4
    if ($px.Bytes[$i] -lt $threshold -or $px.Bytes[$i + 1] -lt $threshold -or $px.Bytes[$i + 2] -lt $threshold) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

if ($maxX -lt 0) { throw "Aucun contenu détecté dans l'image." }

$boxW = $maxX - $minX + 1
$boxH = $maxY - $minY + 1
"Boîte du logo : x=$minX y=$minY w=$boxW h=$boxH" | Write-Host

# --- 2. Logo détouré, redimensionné pour l'en-tête ---------------------------
# Les grandes images partent en JPEG : même rendu à l'œil, mais 5 à 10 fois plus
# léger qu'un PNG (le logo source est un JPEG, son bruit fait exploser le PNG).
# Le PNG est réservé à ce qu'Apple impose (apple-touch-icon).
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$jpegParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$jpegParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 92L)

$logoW = [int][Math]::Round($boxW * ($LogoHeight / $boxH))
$logo = New-Object System.Drawing.Bitmap($logoW, $LogoHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = New-Graphics $logo
$dest = New-Object System.Drawing.Rectangle(0, 0, $logoW, $LogoHeight)
$g.DrawImage($src, $dest, $minX, $minY, $boxW, $boxH, [System.Drawing.GraphicsUnit]::Pixel, $wrap)
$g.Dispose()
Set-Posterize $logo 8
$logoPath = Join-Path $root 'src\assets\logo.jpg'
$logo.Save($logoPath, $jpegCodec, $jpegParams)
$logo.Dispose()
"src/assets/logo.jpg : ${logoW}x${LogoHeight} ({0} Ko)" -f [Math]::Round((Get-Item $logoPath).Length / 1KB, 1) | Write-Host

# --- 3. Monogramme : le disque occupe le carré de gauche ---------------------
$markSize = [Math]::Min($boxH, $boxW)
$bg = $src.GetPixel($minX + [int]($markSize * 0.5), $minY + [int]($markSize * 0.06))
if (($bg.R + $bg.G + $bg.B) -gt 420) { $bg = [System.Drawing.ColorTranslator]::FromHtml('#0b2545') }
"Couleur de fond du monogramme : R={0} G={1} B={2}" -f $bg.R, $bg.G, $bg.B | Write-Host

# Rendu lissé du monogramme, réutilisé pour chaque taille.
$mark = New-SmoothMark $src $minX $minY $markSize 64

$targets = @(
  @{ Name = 'icon-192.jpg'; Size = 192; Ratio = 0.88; Format = 'jpeg' },
  @{ Name = 'icon-512.jpg'; Size = 512; Ratio = 0.88; Format = 'jpeg' },
  @{ Name = 'maskable-512.jpg'; Size = 512; Ratio = 0.62; Format = 'jpeg' },
  @{ Name = 'apple-touch-icon.png'; Size = 180; Ratio = 0.84; Format = 'png' },
  @{ Name = 'favicon-48.png'; Size = 48; Ratio = 0.84; Format = 'png' }
)

foreach ($t in $targets) {
  $size = $t.Size
  $canvas = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = New-Graphics $canvas
  $g.Clear($bg)
  $draw = [int][Math]::Round($size * $t.Ratio)
  $offset = [int](($size - $draw) / 2)
  $dest = New-Object System.Drawing.Rectangle($offset, $offset, $draw, $draw)
  $g.DrawImage($mark, $dest, 0, 0, $mark.Width, $mark.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrap)
  $g.Dispose()
  Set-Posterize $canvas 8
  $out = Join-Path $iconsDir $t.Name
  if ($t.Format -eq 'jpeg') {
    $canvas.Save($out, $jpegCodec, $jpegParams)
  } else {
    $canvas.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  $canvas.Dispose()
  "{0,-22} {1}x{1,-4} {2,6} Ko" -f $t.Name, $size, [Math]::Round((Get-Item $out).Length / 1KB, 1) | Write-Host
}

$mark.Dispose()
$src.Dispose()
"Terminé." | Write-Host
