import { useState, useEffect } from "react"
import useProfile, { type ProfileUser } from "../hooks/useProfile"
import useAuth from "../hooks/useAuth"

interface Props {
  onBack: () => void
}

export default function SettingsPage({ onBack }: Props) {
  const { user: me, getToken } = useAuth()
  const { updateProfile, changePassword, loading, error } = useProfile()

  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [form, setForm] = useState({ username: "", bio: "", avatarUrl: "", isPublic: true })
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" })
  const [saved, setSaved] = useState("")
  const [pwError, setPwError] = useState("")
  const [pwSaved, setPwSaved] = useState(false)

  useEffect(() => {
    if (!me) return
    fetch("https://cardvault-backend-plgs.onrender.com/api/auth/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) {
          setProfile(data)
          setForm({
            username: data.username || "",
            bio: data.bio || "",
            avatarUrl: data.avatarUrl || "",
            isPublic: data.isPublic ?? true,
          })
        }
      })
  }, [])

  const handleSave = async () => {
    setSaved("")
    const updated = await updateProfile(form)
    if (updated) {
      setProfile(updated)
      setSaved("Perfil salvo!")
      setTimeout(() => setSaved(""), 3000)
    }
  }

  const handlePassword = async () => {
    setPwError("")
    setPwSaved(false)
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError("As senhas não coincidem")
      return
    }
    const ok = await changePassword(pwForm.currentPassword, pwForm.newPassword)
    if (ok) {
      setPwSaved(true)
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" })
      setTimeout(() => setPwSaved(false), 3000)
    }
  }

  const initials = profile?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "0 20px 80px" }}>
      <button
        onClick={onBack}
        style={{ background: "none", border: "none", color: "#6b7280", fontSize: "0.8rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", padding: "0 0 40px", display: "block" }}
      >
        ← Voltar
      </button>

      <h2 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "2px", color: "#6b7280", marginBottom: "40px", fontWeight: 500 }}>
        Configurações
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: form.avatarUrl ? "transparent" : "#22262a",
          border: "1px solid #22262a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", fontWeight: 500, color: "#9ca3af",
          flexShrink: 0, overflow: "hidden",
        }}>
          {form.avatarUrl
            ? <img src={form.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
            : initials}
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 500, marginBottom: "2px" }}>{profile?.name || me?.name}</div>
          <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>@{form.username || "..."}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginBottom: "48px" }}>
        <Field label="Username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} placeholder="seunome" />
        <Field label="Bio" value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} placeholder="Colecionador de Pokémon TCG..." maxLength={160} />
        <Field label="URL do avatar" value={form.avatarUrl} onChange={v => setForm(f => ({ ...f, avatarUrl: v }))} placeholder="https://..." />

        <div>
          <label style={labelStyle}>Visibilidade da coleção</label>
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            {[{ val: true, label: "Pública" }, { val: false, label: "Privada" }].map(opt => (
              <button
                key={String(opt.val)}
                onClick={() => setForm(f => ({ ...f, isPublic: opt.val }))}
                style={{
                  padding: "8px 20px", fontSize: "0.8rem", letterSpacing: "1px", textTransform: "uppercase",
                  border: `1px solid ${form.isPublic === opt.val ? "#ffffff" : "#22262a"}`,
                  color: form.isPublic === opt.val ? "#fff" : "#6b7280",
                  background: "transparent", cursor: "pointer", borderRadius: "50px",
                  transition: "all 0.2s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</p>}
      {saved && <p style={{ color: "#10b981", fontSize: "0.85rem", marginBottom: "16px" }}>{saved}</p>}

      <button className="SearchButton" onClick={handleSave} disabled={loading} style={{ marginBottom: "60px" }}>
        {loading ? "Salvando..." : "Salvar perfil"}
      </button>

      <div style={{ borderTop: "1px solid #22262a", paddingTop: "48px" }}>
        <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "2px", color: "#6b7280", marginBottom: "32px", fontWeight: 500 }}>
          Alterar senha
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
          <Field label="Senha atual" value={pwForm.currentPassword} onChange={v => setPwForm(f => ({ ...f, currentPassword: v }))} type="password" placeholder="••••••••" />
          <Field label="Nova senha" value={pwForm.newPassword} onChange={v => setPwForm(f => ({ ...f, newPassword: v }))} type="password" placeholder="••••••••" />
          <Field label="Confirmar nova senha" value={pwForm.confirm} onChange={v => setPwForm(f => ({ ...f, confirm: v }))} type="password" placeholder="••••••••" />
        </div>

        {pwError && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px" }}>{pwError}</p>}
        {pwSaved && <p style={{ color: "#10b981", fontSize: "0.85rem", marginBottom: "16px" }}>Senha alterada!</p>}

        <button className="SearchButton" onClick={handlePassword} disabled={loading}>
          {loading ? "Salvando..." : "Alterar senha"}
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text", maxLength }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; maxLength?: number
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        className="SearchInput"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ display: "block", marginTop: "8px" }}
      />
      {maxLength && (
        <div style={{ textAlign: "right", color: "#6b7280", fontSize: "0.75rem", marginTop: "4px" }}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#6b7280",
  fontWeight: 500,
}