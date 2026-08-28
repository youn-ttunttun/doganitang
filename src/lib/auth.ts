import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getClient, isBackendReady } from './supabase'

export type Role = 'student' | 'tutor' | 'admin'

export type Profile = {
  id: string
  name: string
  role: Role
}

export type AuthState = {
  loading: boolean
  session: Session | null
  profile: Profile | null
}

/** 로그인 상태와 역할을 함께 알려줍니다. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: isBackendReady,
    session: null,
    profile: null,
  })

  useEffect(() => {
    if (!isBackendReady) return
    const client = getClient()
    let alive = true

    async function loadProfile(session: Session | null) {
      if (!session) {
        if (alive) setState({ loading: false, session: null, profile: null })
        return
      }

      const { data } = await client
        .from('profiles')
        .select('id, name, role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!alive) return
      setState({
        loading: false,
        session,
        profile: data ? { id: data.id, name: data.name ?? '', role: data.role as Role } : null,
      })
    }

    client.auth.getSession().then(({ data }) => loadProfile(data.session))

    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      loadProfile(session)
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return state
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getClient().auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export async function signUp(email: string, password: string, name: string): Promise<void> {
  const { error } = await getClient().auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw new Error(error.message)
}

export async function signOut(): Promise<void> {
  await getClient().auth.signOut()
}
