# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec for the PonyFlow engine binary.

block_cipher = None

a = Analysis(
    ['engine.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('agents/skills/ponytail.md', 'engine/agents/skills'),
    ],
    hiddenimports=[
        'langchain_ollama',
        'langchain_core',
        'langgraph',
        'httpx',
        'agents.planner',
        'agents.coder',
        'agents.tester',
        'agents.reader',
        'utils.llm',
        'config',
        'state',
        'graph',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='ponyflow-engine',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
