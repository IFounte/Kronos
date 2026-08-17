Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 99, 102, 241), 25)
$g.DrawEllipse($pen, 25, 25, 462, 462)
$penWhite = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 232, 232, 240), 25)
$penWhite.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penWhite.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($penWhite, 256, 256, 256, 112)
$penWhite.Width = 17
$g.DrawLine($penWhite, 256, 256, 348, 296)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 99, 102, 241))
$g.FillEllipse($brush, 236, 236, 40, 40)
$bmp.Save("assets\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192 = New-Object System.Drawing.Bitmap($bmp, 192, 192)
$bmp192.Save("assets\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$bmp192.Dispose()
