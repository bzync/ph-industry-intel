import { useState, useMemo } from 'react'
import { TextField, Label, Input, Chip, Card, CardContent } from '@heroui/react'
import { isValidCode, getNode } from '@bzync/ph-industry-intel'

const PRESETS = [
  { label: 'Valid subclass 62011', code: '62011' },
  { label: 'Valid class 6201', code: '6201' },
  { label: 'Valid division 62', code: '62' },
  { label: 'Valid section J', code: 'J' },
  { label: 'Invalid code', code: '99999' },
  { label: 'Invalid section', code: 'Z' },
]

export default function ValidateDemo() {
  const [code, setCode] = useState('')

  const result = useMemo(() => {
    const trimmed = code.trim()
    if (!trimmed) return null
    const valid = isValidCode(trimmed)
    const node = valid ? getNode(trimmed) : null
    return { valid, node }
  }, [code])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-foreground-400">Presets:</span>
        {PRESETS.map((p) => (
          <Chip
            key={p.code}
            variant="soft"
            size="sm"
            className="cursor-pointer"
            onClick={() => setCode(p.code)}
          >
            {p.label}
          </Chip>
        ))}
      </div>

      <TextField value={code} onChange={setCode} className="max-w-xs">
        <Label className="text-sm text-foreground-500">PSIC code</Label>
        <Input
          type="text"
          placeholder="e.g. 62011"
          className="font-mono text-base"
          autoComplete="off"
          spellCheck={false}
        />
      </TextField>

      {!code.trim() && (
        <div className="rounded-xl border-2 border-dashed border-divider p-8 text-center text-foreground-400 text-sm">
          Enter a PSIC code above to validate it
        </div>
      )}

      {result && (
        <Card
          className={[
            'border',
            result.valid ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5',
          ].join(' ')}
        >
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className={result.valid ? 'text-success text-lg' : 'text-danger text-lg'}>
                {result.valid ? '✓' : '✕'}
              </span>
              <span className={['font-semibold text-sm', result.valid ? 'text-success' : 'text-danger'].join(' ')}>
                {result.valid ? 'Valid PSIC code' : 'Invalid PSIC code'}
              </span>
              <code className="font-mono text-xs bg-content2 text-foreground-600 px-2 py-0.5 rounded ml-auto">
                {code.trim()}
              </code>
            </div>

            {result.node && (
              <div className="pt-2 border-t border-divider space-y-2">
                <div className="flex items-center gap-3">
                  <Chip size="sm" variant="soft" className="capitalize shrink-0">
                    {result.node.level}
                  </Chip>
                  <span className="text-sm text-foreground">{result.node.title}</span>
                </div>
                {result.node.parentCode && (
                  <p className="text-xs text-foreground-400">
                    Parent code:{' '}
                    <code className="font-mono bg-content2 px-1 rounded">{result.node.parentCode}</code>
                  </p>
                )}
              </div>
            )}

            {!result.valid && (
              <p className="text-sm text-foreground-500 pt-1">
                Sections use a single uppercase letter (A–U). Divisions are 2 digits, groups 3, classes 4, subclasses 5.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
