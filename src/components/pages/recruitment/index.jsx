import { useState } from "react";
import { recruitmentAPI } from "@/utils/APIs/recruitmentAPI";

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0 }}/>
      <div style={{ position:"relative",zIndex:1,width:"100%",maxWidth:480,
        background:"#111827",border:"1px solid #1f2937",borderRadius:16,
        boxShadow:"0 25px 60px rgba(0,0,0,0.6)",fontFamily:"inherit" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"18px 22px 16px",borderBottom:"1px solid #1f2937" }}>
          <h2 style={{ margin:0,fontSize:15,fontWeight:600,color:"#f9fafb" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#6b7280",
            fontSize:20,cursor:"pointer",lineHeight:1,padding:0 }}>×</button>
        </div>
        <div style={{ padding:"20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
      <label style={{ fontSize:10,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.08em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inp = {
  width:"100%",background:"#0d1117",border:"1px solid #374151",borderRadius:8,
  padding:"9px 12px",color:"#f9fafb",fontSize:13,fontFamily:"inherit",
  boxSizing:"border-box",outline:"none",
};
const btnSave = {
  width:"100%",padding:"10px 0",background:"#fbbf24",border:"none",borderRadius:8,
  color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",
};

// ── CreateJobModal ────────────────────────────────────────────────────────────
export function CreateJobModal({ onClose, onCreated }) {
  const [form,setForm] = useState({ startupId:"",title:"",department:"",location:"",isRemote:false,description:"" });
  const [saving,setSaving] = useState(false);
  const [error,setError]   = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if(!form.startupId||!form.title){ setError("Startup ID and title are required."); return; }
    setSaving(true); setError("");
    try { await recruitmentAPI.createJob({...form,startupId:parseInt(form.startupId)}); onCreated(); }
    catch(e){ setError(e?.response?.data?.error??"Failed to create job."); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Create New Role" onClose={onClose}>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <Field label="Startup ID *"><input style={inp} type="number" placeholder="e.g. 1" value={form.startupId} onChange={e=>set("startupId",e.target.value)}/></Field>
        <Field label="Job Title *"><input style={inp} placeholder="e.g. Senior Backend Engineer" value={form.title} onChange={e=>set("title",e.target.value)}/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <Field label="Department"><input style={inp} placeholder="Engineering" value={form.department} onChange={e=>set("department",e.target.value)}/></Field>
          <Field label="Location"><input style={inp} placeholder="Lagos, NG" value={form.location} onChange={e=>set("location",e.target.value)}/></Field>
        </div>
        <Field label="Description"><textarea style={{...inp,resize:"vertical"}} rows={3} placeholder="What will this person do?" value={form.description} onChange={e=>set("description",e.target.value)}/></Field>
        <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"#9ca3af" }}>
          <input type="checkbox" style={{ accentColor:"#fbbf24" }} checked={form.isRemote} onChange={e=>set("isRemote",e.target.checked)}/> Remote role
        </label>
        {error&&<p style={{ margin:0,fontSize:12,color:"#f87171" }}>{error}</p>}
        <button onClick={submit} disabled={saving} style={{...btnSave,opacity:saving?0.6:1}}>{saving?"Creating...":"Create Role"}</button>
      </div>
    </Modal>
  );
}

export default CreateJobModal;

// ── AddApplicantModal ─────────────────────────────────────────────────────────
export function AddApplicantModal({ jobId, onClose, onCreated }) {
  const [form,setForm] = useState({ name:"",email:"",phone:"",linkedin:"",portfolio:"",resumeUrl:"",stage:"sourced",score:"" });
  const [saving,setSaving] = useState(false);
  const [error,setError]   = useState("");
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const STAGES=["sourced","contacted","responded","screening","interviewing","offer_sent","hired","rejected","withdrawn"];

  const submit = async () => {
    if(!form.name){ setError("Name is required."); return; }
    setSaving(true); setError("");
    try { await recruitmentAPI.addApplicant(jobId,{...form,score:form.score?parseFloat(form.score):undefined}); onCreated(); }
    catch(e){ setError(e?.response?.data?.error??"Failed to add applicant."); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Add Candidate" onClose={onClose}>
      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        <Field label="Full Name *"><input style={inp} placeholder="Jane Smith" value={form.name} onChange={e=>set("name",e.target.value)}/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <Field label="Email"><input style={inp} type="email" placeholder="jane@co.com" value={form.email} onChange={e=>set("email",e.target.value)}/></Field>
          <Field label="Phone"><input style={inp} placeholder="+234..." value={form.phone} onChange={e=>set("phone",e.target.value)}/></Field>
        </div>
        <Field label="LinkedIn URL"><input style={inp} placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={e=>set("linkedin",e.target.value)}/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <Field label="Resume URL"><input style={inp} placeholder="https://..." value={form.resumeUrl} onChange={e=>set("resumeUrl",e.target.value)}/></Field>
          <Field label="Portfolio URL"><input style={inp} placeholder="https://..." value={form.portfolio} onChange={e=>set("portfolio",e.target.value)}/></Field>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <Field label="Initial Stage">
            <select style={{...inp,appearance:"none"}} value={form.stage} onChange={e=>set("stage",e.target.value)}>
              {STAGES.map(s=><option key={s} value={s} style={{ background:"#111827" }}>{s.replace("_"," ")}</option>)}
            </select>
          </Field>
          <Field label="Fit Score (0–100)"><input style={inp} type="number" min="0" max="100" placeholder="e.g. 82" value={form.score} onChange={e=>set("score",e.target.value)}/></Field>
        </div>
        {error&&<p style={{ margin:0,fontSize:12,color:"#f87171" }}>{error}</p>}
        <button onClick={submit} disabled={saving} style={{...btnSave,opacity:saving?0.6:1}}>{saving?"Adding...":"Add Candidate"}</button>
      </div>
    </Modal>
  );
}

// ── LogOutreachModal ──────────────────────────────────────────────────────────
export function LogOutreachModal({ applicantId, onClose, onLogged }) {
  const [form,setForm] = useState({ channel:"email",status:"sent",subject:"",body:"",templateUsed:"",followUpAt:"" });
  const [saving,setSaving] = useState(false);
  const [error,setError]   = useState("");
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    setSaving(true); setError("");
    try { await recruitmentAPI.logOutreach(applicantId,{...form,followUpAt:form.followUpAt||undefined}); onLogged(); }
    catch(e){ setError(e?.response?.data?.error??"Failed to log outreach."); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Log Outreach" onClose={onClose}>
      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <Field label="Channel">
            <select style={{...inp,appearance:"none"}} value={form.channel} onChange={e=>set("channel",e.target.value)}>
              {["email","linkedin","twitter","phone","referral","other"].map(c=><option key={c} value={c} style={{ background:"#111827" }}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select style={{...inp,appearance:"none"}} value={form.status} onChange={e=>set("status",e.target.value)}>
              {["sent","opened","replied","bounced","no_reply"].map(s=><option key={s} value={s} style={{ background:"#111827" }}>{s.replace("_"," ")}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Subject"><input style={inp} placeholder="Re: Exciting opportunity..." value={form.subject} onChange={e=>set("subject",e.target.value)}/></Field>
        <Field label="Message Body"><textarea style={{...inp,resize:"vertical"}} rows={4} placeholder="Paste what was sent..." value={form.body} onChange={e=>set("body",e.target.value)}/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <Field label="Template Used"><input style={inp} placeholder="e.g. cold-v2" value={form.templateUsed} onChange={e=>set("templateUsed",e.target.value)}/></Field>
          <Field label="Follow-up Date"><input style={inp} type="date" value={form.followUpAt} onChange={e=>set("followUpAt",e.target.value)}/></Field>
        </div>
        {error&&<p style={{ margin:0,fontSize:12,color:"#f87171" }}>{error}</p>}
        <button onClick={submit} disabled={saving} style={{...btnSave,opacity:saving?0.6:1}}>{saving?"Logging...":"Log Outreach"}</button>
      </div>
    </Modal>
  );
}

// ── CreateReferralModal ───────────────────────────────────────────────────────
export function CreateReferralModal({ jobId, onClose, onCreated }) {
  const [form,setForm] = useState({ candidateName:"",candidateEmail:"",candidateLinkedin:"",note:"" });
  const [saving,setSaving] = useState(false);
  const [error,setError]   = useState("");
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if(!form.candidateName){ setError("Candidate name is required."); return; }
    setSaving(true); setError("");
    try { await recruitmentAPI.createReferral(jobId,form); onCreated(); }
    catch(e){ setError(e?.response?.data?.error??"Failed to submit referral."); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Submit a Referral" onClose={onClose}>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <Field label="Candidate Name *"><input style={inp} placeholder="John Doe" value={form.candidateName} onChange={e=>set("candidateName",e.target.value)}/></Field>
        <Field label="Candidate Email"><input style={inp} type="email" placeholder="john@example.com" value={form.candidateEmail} onChange={e=>set("candidateEmail",e.target.value)}/></Field>
        <Field label="LinkedIn Profile"><input style={inp} placeholder="https://linkedin.com/in/..." value={form.candidateLinkedin} onChange={e=>set("candidateLinkedin",e.target.value)}/></Field>
        <Field label="Why are you referring them?"><textarea style={{...inp,resize:"vertical"}} rows={3} placeholder="They're a great fit because..." value={form.note} onChange={e=>set("note",e.target.value)}/></Field>
        {error&&<p style={{ margin:0,fontSize:12,color:"#f87171" }}>{error}</p>}
        <button onClick={submit} disabled={saving} style={{...btnSave,opacity:saving?0.6:1}}>{saving?"Submitting...":"Submit Referral"}</button>
      </div>
    </Modal>
  );
}