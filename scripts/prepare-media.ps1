# Builds every media file the site serves from the original sources.
# Re-run after replacing a source:  powershell -ExecutionPolicy Bypass -File scripts\prepare-media.ps1
param(
    [string]$Scene = "$HOME\Downloads\Gemini_Generated_Image_6cqs1m6cqs1m6cqs.jfif",
    [string]$Statue = "$HOME\Downloads\749419763_2157016085232065_8806760993999225608_n.jfif",
    [string]$Audio = 'D:\Dionisio Samillano\Downloads\choros-booking-demo-[AudioTrimmer.com].mp3',
    [string]$Logo = 'D:\NEXTjs\STUDENTWEBSOLUTIONS\public\assets\images\logo.png',
    [string]$Ffmpeg = 'C:\ffmpeg\ffmpeg.exe',
    [string]$Ffprobe = 'C:\ffmpeg\ffprobe.exe'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$media = Join-Path $root 'public\media'
$app = Join-Path $root 'app'
New-Item -ItemType Directory -Force $media | Out-Null

function Run([string[]]$ffArgs) {
    & $Ffmpeg -y -hide_banner -loglevel error @ffArgs
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed: $($ffArgs -join ' ')" }
}

# Scene: full resolution, because the camera zooms into it.
Run @('-i', $Scene, '-q:v', '3', "$media\scene.jpg")
Run @('-i', $Scene, '-c:v', 'libwebp', '-quality', '82', "$media\scene.webp")
Run @('-i', $Scene, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '4', '-pix_fmt', 'yuv420p', "$media\scene.avif")
# Tiny blurred placeholder shown behind the gate while the full scene loads.
Run @('-i', $Scene, '-vf', 'scale=48:-2,gblur=sigma=1.2', '-q:v', '6', "$media\scene-blur.jpg")

# Statue photo and company logo.
Run @('-i', $Statue, '-c:v', 'libwebp', '-quality', '82', "$media\statue.webp")
Run @('-i', $Logo, '-vf', 'scale=720:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '90', "$media\sws-logo.webp")

# Audio: strip cover art and tags, soften the edges. Duration is unchanged so SHOUT_AT stays valid.
$dur = [double]::Parse((& $Ffprobe -v error -show_entries format=duration -of csv=p=0 $Audio), [Globalization.CultureInfo]::InvariantCulture)
$fadeOut = ($dur - 0.8).ToString('0.###', [Globalization.CultureInfo]::InvariantCulture)
Run @('-i', $Audio, '-vn', '-map_metadata', '-1', '-af', "afade=t=in:d=0.3,afade=t=out:st=${fadeOut}:d=0.8", '-c:a', 'libmp3lame', '-b:a', '192k', "$media\tribute.mp3")

# Open Graph card (1200x630): Rene on the right, name on a darkened left side.
# Text goes through UTF-8 files (curly quotes, en dash) and relative paths, which keeps
# this script ASCII-only for Windows PowerShell and avoids escaping drive-letter colons.
$work = Join-Path $env:TEMP 'rene-og'
New-Item -ItemType Directory -Force $work | Out-Null
$utf8 = New-Object Text.UTF8Encoding $false
$lines = @{
    'l1.txt' = 'ISANG PAGPUPUGAY'
    'l2.txt' = "Rene $([char]0x201C)Bobet$([char]0x201D)"
    'l3.txt' = 'Baterbonia'
    'l4.txt' = "Mayo 8, 2008 $([char]0x2013) Hunyo 8, 2026"
    'l5.txt' = 'Mula Talacogon, para sa buong Pilipinas.'
}
foreach ($k in $lines.Keys) { [IO.File]::WriteAllText((Join-Path $work $k), $lines[$k], $utf8) }
Copy-Item 'C:\Windows\Fonts\georgia.ttf', 'C:\Windows\Fonts\georgiab.ttf' $work -Force
$og = "[0:v]crop=1905:1000:596:150,scale=1200:630:flags=lanczos[bg];" +
    "color=c=black:s=1200x630,format=rgba,geq=r=7:g=11:b=20:a='255*clip(1.05-X/W*1.35\,0\,0.92)'[shade];" +
    "[bg][shade]overlay,format=yuv420p," +
    "drawtext=fontfile=georgia.ttf:textfile=l1.txt:fontcolor=0xF2C46D:fontsize=26:x=70:y=170," +
    "drawtext=fontfile=georgiab.ttf:textfile=l2.txt:fontcolor=0xF5EFE3:fontsize=76:x=66:y=220," +
    "drawtext=fontfile=georgiab.ttf:textfile=l3.txt:fontcolor=0xF5EFE3:fontsize=76:x=66:y=305," +
    "drawtext=fontfile=georgia.ttf:textfile=l4.txt:fontcolor=0xF5EFE3@0.85:fontsize=30:x=70:y=410," +
    "drawtext=fontfile=georgia.ttf:textfile=l5.txt:fontcolor=0xF5EFE3@0.7:fontsize=24:x=70:y=460"
Push-Location $work
try { Run @('-i', $Scene, '-filter_complex', $og, '-frames:v', '1', '-q:v', '2', "$app\opengraph-image.jpg") } finally { Pop-Location }
Copy-Item "$app\opengraph-image.jpg" "$app\twitter-image.jpg" -Force

# Icons: square crop of his face.
Run @('-i', $Scene, '-vf', 'crop=380:380:1701:150,scale=192:192:flags=lanczos', "$app\icon.png")
Run @('-i', $Scene, '-vf', 'crop=380:380:1701:150,scale=180:180:flags=lanczos', "$app\apple-icon.png")

Get-ChildItem $media, "$app\*image*", "$app\*icon*" | Select-Object Name, @{ n = 'KB'; e = { [math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize
